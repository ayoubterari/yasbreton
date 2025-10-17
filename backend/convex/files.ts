import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============ CATEGORIES ============

// Créer une catégorie
export const createCategory = mutation({
  args: {
    nameFr: v.string(),
    nameAr: v.string(),
    descriptionFr: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      ...args,
      createdAt: Date.now(),
      deleted: false,
    });
    return categoryId;
  },
});

// Récupérer toutes les catégories
export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();
    return categories;
  },
});

// ============ TAGS ============

// Créer ou récupérer un tag
export const getOrCreateTag = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      return existing._id;
    }

    const tagId = await ctx.db.insert("tags", {
      name: args.name,
      createdAt: Date.now(),
    });
    return tagId;
  },
});

// Récupérer tous les tags
export const getTags = query({
  handler: async (ctx) => {
    const tags = await ctx.db.query("tags").collect();
    return tags.map((t) => t.name);
  },
});

// Rechercher des tags (autocomplétion)
export const searchTags = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const allTags = await ctx.db.query("tags").collect();
    const filtered = allTags.filter((t) =>
      t.name.toLowerCase().includes(args.search.toLowerCase())
    );
    return filtered.map((t) => t.name);
  },
});

// ============ FILES ============

// Créer un fichier
export const createFile = mutation({
  args: {
    titleFr: v.string(),
    titleAr: v.string(),
    descriptionFr: v.string(),
    descriptionAr: v.string(),
    categories: v.array(v.id("categories")),
    tags: v.array(v.string()),
    type: v.union(v.literal("free"), v.literal("premium")),
    fileUrl: v.string(),
    storageId: v.optional(v.id("_storage")),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Créer les tags s'ils n'existent pas
    for (const tagName of args.tags) {
      await ctx.db
        .query("tags")
        .withIndex("by_name", (q) => q.eq("name", tagName))
        .first()
        .then(async (existing) => {
          if (!existing) {
            await ctx.db.insert("tags", {
              name: tagName,
              createdAt: Date.now(),
            });
          }
        });
    }

    const fileId = await ctx.db.insert("files", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false,
    });

    return fileId;
  },
});

// Récupérer tous les fichiers (non supprimés)
export const getFiles = query({
  handler: async (ctx) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_deleted")
      .filter((q) => q.neq(q.field("deleted"), true))
      .order("desc")
      .collect();

    return files;
  },
});

// Récupérer un fichier par ID
export const getFileById = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    
    if (!file || file.deleted) {
      return null;
    }

    // Si le fichier a un storageId, récupérer l'URL réelle depuis Convex Storage
    if (file.storageId) {
      const url = await ctx.storage.getUrl(file.storageId);
      return {
        ...file,
        fileUrl: url || file.fileUrl, // Utiliser l'URL de storage ou fallback sur fileUrl
      };
    }

    return file;
  },
});

// Mettre à jour un fichier
export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    titleFr: v.string(),
    titleAr: v.string(),
    descriptionFr: v.string(),
    descriptionAr: v.string(),
    categories: v.array(v.id("categories")),
    tags: v.array(v.string()),
    type: v.union(v.literal("free"), v.literal("premium")),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { fileId, ...updates } = args;

    // Créer les nouveaux tags s'ils n'existent pas
    for (const tagName of updates.tags) {
      const existing = await ctx.db
        .query("tags")
        .withIndex("by_name", (q) => q.eq("name", tagName))
        .first();

      if (!existing) {
        await ctx.db.insert("tags", {
          name: tagName,
          createdAt: Date.now(),
        });
      }
    }

    const updateData: any = {
      titleFr: updates.titleFr,
      titleAr: updates.titleAr,
      descriptionFr: updates.descriptionFr,
      descriptionAr: updates.descriptionAr,
      categories: updates.categories,
      tags: updates.tags,
      type: updates.type,
      updatedAt: Date.now(),
    };

    // Mettre à jour le fichier si fourni
    if (updates.fileUrl) {
      updateData.fileUrl = updates.fileUrl;
      updateData.fileName = updates.fileName;
      updateData.fileType = updates.fileType;
      updateData.fileSize = updates.fileSize;
    }

    await ctx.db.patch(fileId, updateData);

    return { success: true };
  },
});

// Supprimer un fichier (soft delete)
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      deleted: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Filtrer les fichiers
export const filterFiles = query({
  args: {
    type: v.optional(v.union(v.literal("free"), v.literal("premium"))),
    categoryId: v.optional(v.id("categories")),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let files = await ctx.db
      .query("files")
      .withIndex("by_deleted")
      .filter((q) => q.neq(q.field("deleted"), true))
      .collect();

    if (args.type) {
      files = files.filter((f) => f.type === args.type);
    }

    if (args.categoryId !== undefined) {
      files = files.filter((f) => f.categories.includes(args.categoryId!));
    }

    if (args.tag !== undefined) {
      files = files.filter((f) => f.tags.includes(args.tag!));
    }

    return files;
  },
});

// ============ FILE STORAGE ============

// Générer une URL d'upload pour Convex Storage
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Obtenir l'URL de téléchargement d'un fichier depuis Convex Storage
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
