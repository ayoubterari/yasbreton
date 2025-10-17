import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ========== DOMAINES ==========

// Créer un domaine
export const createDomain = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const domainId = await ctx.db.insert("domains", {
      name: args.name,
      description: args.description,
      order: args.order,
      createdAt: now,
      deleted: false,
    });

    return domainId;
  },
});

// Obtenir tous les domaines
export const getAllDomains = query({
  handler: async (ctx) => {
    const domains = await ctx.db
      .query("domains")
      .filter((q) => q.eq(q.field("deleted"), false))
      .order("asc")
      .collect();

    return domains;
  },
});

// Obtenir un domaine par ID
export const getDomainById = query({
  args: { domainId: v.id("domains") },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    
    if (!domain || domain.deleted) {
      return null;
    }

    return domain;
  },
});

// Mettre à jour un domaine
export const updateDomain = mutation({
  args: {
    domainId: v.id("domains"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { domainId, ...updates } = args;
    
    const domain = await ctx.db.get(domainId);
    if (!domain || domain.deleted) {
      throw new Error("Domaine introuvable");
    }

    await ctx.db.patch(domainId, updates);

    return { success: true };
  },
});

// Supprimer un domaine (soft delete)
export const deleteDomain = mutation({
  args: { domainId: v.id("domains") },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    
    if (!domain) {
      throw new Error("Domaine introuvable");
    }

    await ctx.db.patch(args.domainId, {
      deleted: true,
    });

    return { success: true };
  },
});

// ========== SOUS-DOMAINES ==========

// Créer un sous-domaine
export const createSubdomain = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    domainId: v.id("domains"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const subdomainId = await ctx.db.insert("subdomains", {
      name: args.name,
      description: args.description,
      domainId: args.domainId,
      order: args.order,
      createdAt: now,
      deleted: false,
    });

    return subdomainId;
  },
});

// Obtenir tous les sous-domaines d'un domaine
export const getSubdomainsByDomain = query({
  args: { domainId: v.id("domains") },
  handler: async (ctx, args) => {
    const subdomains = await ctx.db
      .query("subdomains")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .filter((q) => q.eq(q.field("deleted"), false))
      .order("asc")
      .collect();

    return subdomains;
  },
});

// Obtenir tous les sous-domaines
export const getAllSubdomains = query({
  handler: async (ctx) => {
    const subdomains = await ctx.db
      .query("subdomains")
      .filter((q) => q.eq(q.field("deleted"), false))
      .order("asc")
      .collect();

    return subdomains;
  },
});

// Mettre à jour un sous-domaine
export const updateSubdomain = mutation({
  args: {
    subdomainId: v.id("subdomains"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    domainId: v.optional(v.id("domains")),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { subdomainId, ...updates } = args;
    
    const subdomain = await ctx.db.get(subdomainId);
    if (!subdomain || subdomain.deleted) {
      throw new Error("Sous-domaine introuvable");
    }

    await ctx.db.patch(subdomainId, updates);

    return { success: true };
  },
});

// Supprimer un sous-domaine (soft delete)
export const deleteSubdomain = mutation({
  args: { subdomainId: v.id("subdomains") },
  handler: async (ctx, args) => {
    const subdomain = await ctx.db.get(args.subdomainId);
    
    if (!subdomain) {
      throw new Error("Sous-domaine introuvable");
    }

    await ctx.db.patch(args.subdomainId, {
      deleted: true,
    });

    return { success: true };
  },
});
