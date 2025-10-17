import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Créer une catégorie
export const createCategory = mutation({
  args: {
    nameFr: v.string(),
    nameAr: v.string(),
    descriptionFr: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    // Calculer l'ordre (dernier + 1)
    const siblings = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) =>
        args.parentId ? q.eq("parentId", args.parentId) : q.eq("parentId", undefined)
      )
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();

    const maxOrder = siblings.reduce((max, cat) => Math.max(max, cat.order), -1);

    const categoryId = await ctx.db.insert("categories", {
      nameFr: args.nameFr,
      nameAr: args.nameAr,
      descriptionFr: args.descriptionFr,
      descriptionAr: args.descriptionAr,
      parentId: args.parentId,
      order: maxOrder + 1,
      createdAt: Date.now(),
      deleted: false,
    });

    return categoryId;
  },
});

// Récupérer toutes les catégories (structure hiérarchique)
export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_deleted")
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();

    // Trier par ordre
    return categories.sort((a, b) => a.order - b.order);
  },
});

// Récupérer les catégories racines (sans parent)
export const getRootCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", undefined))
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();

    return categories.sort((a, b) => a.order - b.order);
  },
});

// Récupérer les sous-catégories d'une catégorie
export const getSubCategories = query({
  args: { parentId: v.id("categories") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();

    return categories.sort((a, b) => a.order - b.order);
  },
});

// Mettre à jour une catégorie
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    nameFr: v.string(),
    nameAr: v.string(),
    descriptionFr: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;

    // Vérifier qu'on ne crée pas de boucle (catégorie parente = elle-même ou descendant)
    if (updates.parentId) {
      if (updates.parentId === categoryId) {
        throw new Error("Une catégorie ne peut pas être son propre parent");
      }

      // Vérifier que le parent n'est pas un descendant
      const isDescendant = await checkIfDescendant(ctx, categoryId, updates.parentId);
      if (isDescendant) {
        throw new Error("Le parent sélectionné est un descendant de cette catégorie");
      }
    }

    const currentCategory = await ctx.db.get(categoryId);
    if (!currentCategory) {
      throw new Error("Catégorie non trouvée");
    }

    // Si le parent change, recalculer l'ordre
    if (currentCategory.parentId !== updates.parentId) {
      const siblings = await ctx.db
        .query("categories")
        .withIndex("by_parent", (q) =>
          updates.parentId ? q.eq("parentId", updates.parentId) : q.eq("parentId", undefined)
        )
        .filter((q) => q.neq(q.field("deleted"), true))
        .collect();

      const maxOrder = siblings.reduce((max, cat) => Math.max(max, cat.order), -1);

      await ctx.db.patch(categoryId, {
        ...updates,
        order: maxOrder + 1,
      });
    } else {
      await ctx.db.patch(categoryId, updates);
    }

    return { success: true };
  },
});

// Fonction helper pour vérifier si une catégorie est descendante d'une autre
async function checkIfDescendant(ctx: any, ancestorId: any, categoryId: any): Promise<boolean> {
  const category = await ctx.db.get(categoryId);
  if (!category || !category.parentId) {
    return false;
  }

  if (category.parentId === ancestorId) {
    return true;
  }

  return checkIfDescendant(ctx, ancestorId, category.parentId);
}

// Supprimer une catégorie
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    deleteChildren: v.boolean(), // true = cascade, false = déplacer vers parent
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Catégorie non trouvée");
    }

    // Récupérer les sous-catégories
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.categoryId))
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();

    if (args.deleteChildren) {
      // Suppression en cascade
      for (const child of children) {
        await ctx.db.patch(child._id, { deleted: true });
        // Supprimer récursivement les descendants
        await deleteDescendants(ctx, child._id);
      }
    } else {
      // Déplacer les enfants vers le parent de la catégorie supprimée
      for (const child of children) {
        await ctx.db.patch(child._id, {
          parentId: category.parentId,
        });
      }
    }

    // Supprimer la catégorie
    await ctx.db.patch(args.categoryId, { deleted: true });

    return { success: true };
  },
});

// Fonction helper pour supprimer tous les descendants
async function deleteDescendants(ctx: any, categoryId: any) {
  const children = await ctx.db
    .query("categories")
    .withIndex("by_parent", (q: any) => q.eq("parentId", categoryId))
    .filter((q: any) => q.neq(q.field("deleted"), true))
    .collect();

  for (const child of children) {
    await ctx.db.patch(child._id, { deleted: true });
    await deleteDescendants(ctx, child._id);
  }
}

// Réordonner les catégories
export const reorderCategories = mutation({
  args: {
    categoryId: v.id("categories"),
    newOrder: v.number(),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    // Récupérer toutes les catégories du même niveau
    const siblings = await ctx.db
      .query("categories")
      .withIndex("by_parent")
      .filter((q) => {
        const parentMatch = args.parentId 
          ? q.eq(q.field("parentId"), args.parentId)
          : q.eq(q.field("parentId"), undefined);
        return q.and(parentMatch, q.neq(q.field("deleted"), true));
      })
      .collect();

    // Trier par ordre actuel
    siblings.sort((a, b) => a.order - b.order);

    // Trouver l'index de la catégorie à déplacer
    const currentIndex = siblings.findIndex((c) => c._id === args.categoryId);
    if (currentIndex === -1) {
      throw new Error("Catégorie non trouvée");
    }

    // Retirer la catégorie de sa position actuelle
    const [movedCategory] = siblings.splice(currentIndex, 1);

    // Insérer à la nouvelle position
    siblings.splice(args.newOrder, 0, movedCategory);

    // Mettre à jour l'ordre de toutes les catégories
    for (let i = 0; i < siblings.length; i++) {
      await ctx.db.patch(siblings[i]._id, { order: i });
    }

    return { success: true };
  },
});

// Obtenir le chemin complet d'une catégorie (breadcrumb)
export const getCategoryPath = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const path: Array<{ _id: any; nameFr: string; nameAr: string }> = [];
    let currentId: any = args.categoryId;

    while (currentId) {
      const category: any = await ctx.db.get(currentId);
      if (!category || category.deleted) break;

      path.unshift({
        _id: category._id,
        nameFr: category.nameFr,
        nameAr: category.nameAr,
      });

      currentId = category.parentId;
    }

    return path;
  },
});
