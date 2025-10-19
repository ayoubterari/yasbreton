import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Récupérer tous les utilisateurs (admin ou utilisateur restreint avec permission)
export const getAllUsers = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur existe
    const user = await ctx.db.get(args.adminId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier les permissions
    const isAdmin = user.role === "admin";
    const isRestrictedWithPermission = user.role === "restricted" && user.permissions?.users === true;
    
    if (!isAdmin && !isRestrictedWithPermission) {
      throw new Error("Accès non autorisé");
    }

    // Récupérer tous les utilisateurs
    const users = await ctx.db.query("users").collect();
    
    // Retourner sans les mots de passe
    return users.map(user => ({
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt,
    }));
  },
});

// Supprimer un utilisateur (admin uniquement)
export const deleteUser = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Ne pas permettre de se supprimer soi-même
    if (args.adminId === args.userId) {
      throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    }

    // Supprimer l'utilisateur
    await ctx.db.delete(args.userId);
    
    return { success: true };
  },
});

// Changer le rôle d'un utilisateur (admin uniquement)
export const changeUserRole = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Ne pas permettre de changer son propre rôle
    if (args.adminId === args.userId) {
      throw new Error("Vous ne pouvez pas changer votre propre rôle");
    }

    // Mettre à jour le rôle
    await ctx.db.patch(args.userId, {
      role: args.newRole,
    });

    return { success: true };
  },
});

// Mettre à jour les informations d'un utilisateur (admin uniquement)
export const updateUser = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
    nom: v.string(),
    prenom: v.string(),
    email: v.string(),
    telephone: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser && existingUser._id !== args.userId) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Mettre à jour l'utilisateur
    await ctx.db.patch(args.userId, {
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      telephone: args.telephone,
    });

    return { success: true };
  },
});

// Créer un compte admin (pour initialisation)
export const createAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    nom: v.string(),
    prenom: v.string(),
    telephone: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'email existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Créer le compte admin
    const adminId = await ctx.db.insert("users", {
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      password: args.password,
      telephone: args.telephone,
      role: "admin",
      createdAt: Date.now(),
    });

    return {
      id: adminId,
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      telephone: args.telephone,
      role: "admin" as const,
    };
  },
});

// Créer un utilisateur restreint avec permissions
export const createRestrictedUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    nom: v.string(),
    prenom: v.string(),
    telephone: v.string(),
    permissions: v.object({
      dashboard: v.boolean(),
      users: v.boolean(),
      domains: v.boolean(),
      tasks: v.boolean(),
      formations: v.boolean(),
      resources: v.boolean(),
      settings: v.boolean(),
    }),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que le créateur est admin
    const admin = await ctx.db.get(args.createdBy);
    if (!admin || admin.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Vérifier si l'email existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Créer l'utilisateur restreint
    const userId = await ctx.db.insert("users", {
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      password: args.password,
      telephone: args.telephone,
      role: "restricted",
      permissions: args.permissions,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    return {
      id: userId,
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      telephone: args.telephone,
      role: "restricted" as const,
      permissions: args.permissions,
      createdAt: Date.now(),
    };
  },
});

// Mettre à jour les permissions d'un utilisateur
export const updateUserPermissions = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
    permissions: v.object({
      dashboard: v.boolean(),
      users: v.boolean(),
      domains: v.boolean(),
      tasks: v.boolean(),
      formations: v.boolean(),
      resources: v.boolean(),
      settings: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    // Vérifier que l'utilisateur cible existe et est restreint
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (user.role !== "restricted") {
      throw new Error("Cet utilisateur n'est pas un utilisateur restreint");
    }

    // Mettre à jour les permissions
    await ctx.db.patch(args.userId, {
      permissions: args.permissions,
    });

    return { success: true };
  },
});
