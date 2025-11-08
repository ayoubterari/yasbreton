import { mutation } from "./_generated/server";

/**
 * Fonction d'initialisation pour créer un compte admin
 * À exécuter une seule fois via la console Convex
 */
export const init = mutation({
  args: {},
  handler: async (ctx) => {
    // Vérifier si un admin existe déjà
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    if (existingAdmin) {
      return { 
        success: false,
        message: "Un admin existe déjà",
        adminEmail: existingAdmin.email
      };
    }

    // Créer le compte admin
    const adminId = await ctx.db.insert("users", {
      nom: "Admin",
      prenom: "Centre",
      email: "admin@centre-yasbreton.fr",
      password: "admin123", // À changer immédiatement !
      telephone: "0600000000",
      role: "admin",
      createdAt: Date.now(),
    });

    return { 
      success: true,
      message: "Admin créé avec succès",
      adminId,
      email: "admin@centre-yasbreton.fr",
      password: "admin123"
    };
  },
});
