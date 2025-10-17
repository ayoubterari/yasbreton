import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ========== FORMATIONS ==========

// Créer une formation
export const createFormation = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    thumbnail: v.optional(v.string()),
    previewVideoUrl: v.optional(v.string()),
    category: v.string(),
    level: v.union(v.literal("debutant"), v.literal("intermediaire"), v.literal("avance")),
    duration: v.number(),
    price: v.number(),
    isPremium: v.boolean(),
    instructor: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const formationId = await ctx.db.insert("formations", {
      title: args.title,
      description: args.description,
      thumbnail: args.thumbnail,
      previewVideoUrl: args.previewVideoUrl,
      category: args.category,
      level: args.level,
      duration: args.duration,
      price: args.price,
      isPremium: args.isPremium,
      instructor: args.instructor,
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
      published: false,
      deleted: false,
    });

    return formationId;
  },
});

// Obtenir toutes les formations
export const getAllFormations = query({
  handler: async (ctx) => {
    const formations = await ctx.db
      .query("formations")
      .filter((q) => q.eq(q.field("deleted"), false))
      .order("desc")
      .collect();

    return formations;
  },
});

// Obtenir une formation par ID
export const getFormationById = query({
  args: { formationId: v.id("formations") },
  handler: async (ctx, args) => {
    const formation = await ctx.db.get(args.formationId);
    
    if (!formation || formation.deleted) {
      return null;
    }

    return formation;
  },
});

// Mettre à jour une formation
export const updateFormation = mutation({
  args: {
    formationId: v.id("formations"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    previewVideoUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(v.union(v.literal("debutant"), v.literal("intermediaire"), v.literal("avance"))),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    isPremium: v.optional(v.boolean()),
    instructor: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { formationId, ...updates } = args;
    
    const formation = await ctx.db.get(formationId);
    if (!formation || formation.deleted) {
      throw new Error("Formation introuvable");
    }

    await ctx.db.patch(formationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Supprimer une formation
export const deleteFormation = mutation({
  args: { formationId: v.id("formations") },
  handler: async (ctx, args) => {
    const formation = await ctx.db.get(args.formationId);
    
    if (!formation) {
      throw new Error("Formation introuvable");
    }

    await ctx.db.patch(args.formationId, {
      deleted: true,
    });

    return { success: true };
  },
});

// ========== SECTIONS ==========

// Créer une section
export const createSection = mutation({
  args: {
    formationId: v.id("formations"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const sectionId = await ctx.db.insert("formationSections", {
      formationId: args.formationId,
      title: args.title,
      order: args.order,
      createdAt: Date.now(),
      deleted: false,
    });

    return sectionId;
  },
});

// Obtenir les sections d'une formation
export const getSectionsByFormation = query({
  args: { formationId: v.id("formations") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("formationSections")
      .withIndex("by_formation", (q) => q.eq("formationId", args.formationId))
      .filter((q) => q.eq(q.field("deleted"), false))
      .collect();

    return sections.sort((a, b) => a.order - b.order);
  },
});

// Mettre à jour une section
export const updateSection = mutation({
  args: {
    sectionId: v.id("formationSections"),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sectionId, ...updates } = args;
    
    const section = await ctx.db.get(sectionId);
    if (!section || section.deleted) {
      throw new Error("Section introuvable");
    }

    await ctx.db.patch(sectionId, updates);

    return { success: true };
  },
});

// Supprimer une section
export const deleteSection = mutation({
  args: { sectionId: v.id("formationSections") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sectionId, { deleted: true });
    return { success: true };
  },
});

// ========== LEÇONS ==========

// Créer une leçon
export const createLesson = mutation({
  args: {
    sectionId: v.id("formationSections"),
    formationId: v.id("formations"),
    title: v.string(),
    description: v.optional(v.string()),
    lessonType: v.optional(v.union(v.literal("video"), v.literal("resource"))),
    videoUrl: v.optional(v.string()),
    resourceId: v.optional(v.id("files")),
    duration: v.number(),
    order: v.number(),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const lessonId = await ctx.db.insert("formationLessons", {
      sectionId: args.sectionId,
      formationId: args.formationId,
      title: args.title,
      description: args.description,
      lessonType: args.lessonType || "video",
      videoUrl: args.videoUrl,
      resourceId: args.resourceId,
      duration: args.duration,
      order: args.order,
      isFree: args.isFree || false,
      createdAt: Date.now(),
      deleted: false,
    });

    return lessonId;
  },
});

// Obtenir les leçons d'une section
export const getLessonsBySection = query({
  args: { sectionId: v.id("formationSections") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("formationLessons")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .filter((q) => q.eq(q.field("deleted"), false))
      .collect();

    return lessons.sort((a, b) => a.order - b.order);
  },
});

// Obtenir toutes les leçons d'une formation
export const getLessonsByFormation = query({
  args: { formationId: v.id("formations") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("formationLessons")
      .withIndex("by_formation", (q) => q.eq("formationId", args.formationId))
      .filter((q) => q.eq(q.field("deleted"), false))
      .collect();

    return lessons.sort((a, b) => a.order - b.order);
  },
});

// Mettre à jour une leçon
export const updateLesson = mutation({
  args: {
    lessonId: v.id("formationLessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    lessonType: v.optional(v.union(v.literal("video"), v.literal("resource"))),
    videoUrl: v.optional(v.string()),
    resourceId: v.optional(v.id("files")),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { lessonId, ...updates } = args;
    
    const lesson = await ctx.db.get(lessonId);
    if (!lesson || lesson.deleted) {
      throw new Error("Leçon introuvable");
    }

    await ctx.db.patch(lessonId, updates);

    return { success: true };
  },
});

// Supprimer une leçon
export const deleteLesson = mutation({
  args: { lessonId: v.id("formationLessons") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, { deleted: true });
    return { success: true };
  },
});

// ========== INSCRIPTIONS ==========

// Inscrire un utilisateur à une formation
export const enrollUser = mutation({
  args: {
    userId: v.id("users"),
    formationId: v.id("formations"),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'utilisateur est déjà inscrit
    const existingEnrollment = await ctx.db
      .query("formationEnrollments")
      .withIndex("by_user_formation", (q) => 
        q.eq("userId", args.userId).eq("formationId", args.formationId)
      )
      .first();

    if (existingEnrollment) {
      return { success: true, alreadyEnrolled: true };
    }

    // Récupérer la formation pour vérifier le prix
    const formation = await ctx.db.get(args.formationId);
    if (!formation) {
      throw new Error("Formation introuvable");
    }

    // Créer l'inscription
    const enrollmentId = await ctx.db.insert("formationEnrollments", {
      userId: args.userId,
      formationId: args.formationId,
      enrolledAt: Date.now(),
      paymentStatus: formation.price > 0 ? "paid" : "free",
    });

    return { success: true, enrollmentId, alreadyEnrolled: false };
  },
});

// Vérifier si un utilisateur est inscrit à une formation
export const isUserEnrolled = query({
  args: {
    userId: v.id("users"),
    formationId: v.id("formations"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("formationEnrollments")
      .withIndex("by_user_formation", (q) => 
        q.eq("userId", args.userId).eq("formationId", args.formationId)
      )
      .first();

    return !!enrollment;
  },
});

// Obtenir toutes les inscriptions d'un utilisateur
export const getUserEnrollments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("formationEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return enrollments;
  },
});

// Obtenir les statistiques d'inscription d'une formation
export const getFormationEnrollmentStats = query({
  args: { formationId: v.id("formations") },
  handler: async (ctx, args) => {
    // Récupérer toutes les inscriptions pour cette formation
    const enrollments = await ctx.db
      .query("formationEnrollments")
      .withIndex("by_formation", (q) => q.eq("formationId", args.formationId))
      .collect();

    // Récupérer les informations des utilisateurs inscrits
    const enrollmentsWithUsers = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        return {
          enrollmentId: enrollment._id,
          enrolledAt: enrollment.enrolledAt,
          paymentStatus: enrollment.paymentStatus,
          user: user ? {
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            isPremium: user.isPremium,
          } : null,
        };
      })
    );

    // Statistiques globales
    const totalEnrollments = enrollments.length;
    const freeEnrollments = enrollments.filter(e => e.paymentStatus === "free").length;
    const paidEnrollments = enrollments.filter(e => e.paymentStatus === "paid").length;

    return {
      totalEnrollments,
      freeEnrollments,
      paidEnrollments,
      enrollments: enrollmentsWithUsers.sort((a, b) => b.enrolledAt - a.enrolledAt),
    };
  },
});
