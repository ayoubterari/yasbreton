import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Inscription d'un nouvel utilisateur
export const register = mutation({
  args: {
    nom: v.string(),
    prenom: v.string(),
    email: v.string(),
    password: v.string(),
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

    // Créer le nouvel utilisateur
    // NOTE: En production, hashez le mot de passe avec bcrypt ou argon2
    const userId = await ctx.db.insert("users", {
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      password: args.password, // À hasher en production !
      telephone: args.telephone,
      role: "user", // Par défaut, les nouveaux utilisateurs sont des users
      createdAt: Date.now(),
    });

    // Retourner les infos de l'utilisateur (sans le mot de passe)
    return {
      id: userId,
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      telephone: args.telephone,
      role: "user" as const,
      isPremium: false,
      premiumExpiresAt: undefined,
      subscriptionType: undefined,
      createdAt: Date.now(),
    };
  },
});

// Connexion d'un utilisateur
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Rechercher l'utilisateur par email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Vérifier le mot de passe
    // NOTE: En production, utilisez bcrypt.compare()
    if (user.password !== args.password) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Retourner les infos de l'utilisateur (sans le mot de passe)
    return {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      subscriptionType: user.subscriptionType,
      createdAt: user.createdAt,
    };
  },
});

// Récupérer les informations d'un utilisateur par ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return null;
    }

    // Retourner sans le mot de passe
    return {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      subscriptionType: user.subscriptionType,
      createdAt: user.createdAt,
    };
  },
});

// Vérifier si un email existe déjà
export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return !!user;
  },
});

// Mettre à jour le profil utilisateur
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    nom: v.string(),
    prenom: v.string(),
    telephone: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Vérifier que l'utilisateur existe
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Mettre à jour le profil
    await ctx.db.patch(userId, updates);

    // Retourner les nouvelles infos
    return {
      id: userId,
      nom: updates.nom,
      prenom: updates.prenom,
      email: user.email,
      telephone: updates.telephone,
      role: user.role,
    };
  },
});

// Changer le mot de passe
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier l'ancien mot de passe
    if (user.password !== args.currentPassword) {
      throw new Error("Mot de passe actuel incorrect");
    }

    // Mettre à jour le mot de passe
    await ctx.db.patch(args.userId, {
      password: args.newPassword,
    });

    return { success: true };
  },
});
