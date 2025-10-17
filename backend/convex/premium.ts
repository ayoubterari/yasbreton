import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Activer l'abonnement premium
export const upgradeToPremium = mutation({
  args: {
    userId: v.id("users"),
    subscriptionType: v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Calculer la date d'expiration selon le type d'abonnement
    const now = Date.now();
    let expiresAt: number;

    switch (args.subscriptionType) {
      case "monthly":
        expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 jours
        break;
      case "quarterly":
        expiresAt = now + 90 * 24 * 60 * 60 * 1000; // 90 jours
        break;
      case "yearly":
        expiresAt = now + 365 * 24 * 60 * 60 * 1000; // 365 jours
        break;
    }

    await ctx.db.patch(args.userId, {
      isPremium: true,
      premiumExpiresAt: expiresAt,
      subscriptionType: args.subscriptionType,
    });

    // Enregistrer la conversion dans l'historique
    await ctx.db.insert("premiumConversions", {
      userId: args.userId,
      subscriptionType: args.subscriptionType,
      convertedAt: now,
      expiresAt: expiresAt,
    });

    return { success: true, expiresAt };
  },
});

// Annuler l'abonnement premium
export const cancelPremium = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isPremium: false,
      premiumExpiresAt: undefined,
      subscriptionType: undefined,
    });

    return { success: true };
  },
});
