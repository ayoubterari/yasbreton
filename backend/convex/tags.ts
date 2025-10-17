import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Créer un tag
export const createTag = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier si le tag existe déjà
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Ce tag existe déjà");
    }

    const tagId = await ctx.db.insert("tags", {
      name: args.name,
      createdAt: Date.now(),
    });

    return tagId;
  },
});

// Récupérer tous les tags
export const getAllTags = query({
  handler: async (ctx) => {
    const tags = await ctx.db.query("tags").collect();
    return tags.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Mettre à jour un tag
export const updateTag = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier si le nouveau nom existe déjà
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing && existing._id !== args.tagId) {
      throw new Error("Un tag avec ce nom existe déjà");
    }

    await ctx.db.patch(args.tagId, {
      name: args.name,
    });

    return { success: true };
  },
});

// Supprimer un tag
export const deleteTag = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    // Vérifier si le tag est utilisé dans des fichiers
    const filesWithTag = await ctx.db.query("files").collect();
    const tag = await ctx.db.get(args.tagId);
    
    if (!tag) {
      throw new Error("Tag non trouvé");
    }

    const usageCount = filesWithTag.filter(
      (file) => !file.deleted && file.tags.includes(tag.name)
    ).length;

    if (usageCount > 0) {
      throw new Error(
        `Ce tag est utilisé par ${usageCount} fichier(s). Supprimez-le d'abord des fichiers.`
      );
    }

    await ctx.db.delete(args.tagId);

    return { success: true };
  },
});

// Obtenir les statistiques d'utilisation d'un tag
export const getTagUsage = query({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.tagId);
    if (!tag) {
      return { count: 0, files: [] };
    }

    const allFiles = await ctx.db.query("files").collect();
    const filesWithTag = allFiles.filter(
      (file) => !file.deleted && file.tags.includes(tag.name)
    );

    return {
      count: filesWithTag.length,
      files: filesWithTag.map((f) => ({
        _id: f._id,
        titleFr: f.titleFr,
      })),
    };
  },
});

// Rechercher des tags
export const searchTags = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const allTags = await ctx.db.query("tags").collect();
    const filtered = allTags.filter((t) =>
      t.name.toLowerCase().includes(args.search.toLowerCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  },
});
