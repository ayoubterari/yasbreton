import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Créer une nouvelle tâche
export const createTask = mutation({
  args: {
    title: v.string(),
    videoUrl: v.string(),
    description: v.string(),
    baseline: v.string(),
    technicalDetails: v.string(),
    resources: v.optional(v.string()),
    resourceIds: v.optional(v.array(v.id("files"))),
    subdomainId: v.optional(v.id("subdomains")),
    criteria: v.optional(v.array(v.object({
      title: v.string(),
      videoUrl: v.string(),
    }))),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      videoUrl: args.videoUrl,
      description: args.description,
      baseline: args.baseline,
      technicalDetails: args.technicalDetails,
      resources: args.resources,
      resourceIds: args.resourceIds || [],
      subdomainId: args.subdomainId,
      criteria: args.criteria || [],
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    });

    return taskId;
  },
});

// Obtenir toutes les tâches (non supprimées)
export const getAllTasks = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.neq(q.field("deleted"), true))
      .order("desc")
      .collect();

    return tasks;
  },
});

// Obtenir une tâche par ID
export const getTaskById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    
    if (!task || task.deleted) {
      return null;
    }

    return task;
  },
});

// Mettre à jour une tâche
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    baseline: v.optional(v.string()),
    technicalDetails: v.optional(v.string()),
    resources: v.optional(v.string()),
    resourceIds: v.optional(v.array(v.id("files"))),
    subdomainId: v.optional(v.id("subdomains")),
    criteria: v.optional(v.array(v.object({
      title: v.string(),
      videoUrl: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    
    const task = await ctx.db.get(taskId);
    if (!task || task.deleted) {
      throw new Error("Tâche introuvable");
    }

    await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Obtenir les tâches par sous-domaine
export const getTasksBySubdomain = query({
  args: { subdomainId: v.id("subdomains") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_subdomain", (q) => q.eq("subdomainId", args.subdomainId))
      .filter((q) => q.eq(q.field("deleted"), false))
      .order("desc")
      .collect();

    return tasks;
  },
});

// Supprimer une tâche (soft delete)
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    
    if (!task) {
      throw new Error("Tâche introuvable");
    }

    await ctx.db.patch(args.taskId, {
      deleted: true,
    });

    return { success: true };
  },
});

// Supprimer définitivement une tâche
export const permanentDeleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
    return { success: true };
  },
});

// Obtenir les tâches créées par un utilisateur
export const getTasksByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
      .filter((q) => q.neq(q.field("deleted"), true))
      .order("desc")
      .collect();

    return tasks;
  },
});

// Obtenir les statistiques des tâches
export const getTasksStats = query({
  args: {},
  handler: async (ctx) => {
    const allTasks = await ctx.db.query("tasks").collect();
    
    const activeTasks = allTasks.filter((t) => !t.deleted);
    const deletedTasks = allTasks.filter((t) => t.deleted);

    return {
      total: allTasks.length,
      active: activeTasks.length,
      deleted: deletedTasks.length,
    };
  },
});

// Générer automatiquement plusieurs tâches vides
export const generateEmptyTasks = mutation({
  args: {
    subdomainId: v.id("subdomains"),
    count: v.number(),
    prefix: v.string(),
    criteriaCount: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { subdomainId, count, prefix, criteriaCount, userId } = args;
    
    // Validation
    if (count <= 0 || count > 100) {
      throw new Error("Le nombre de tâches doit être entre 1 et 100");
    }
    
    if (!prefix || prefix.trim().length === 0) {
      throw new Error("Le préfixe ne peut pas être vide");
    }
    
    if (criteriaCount < 0 || criteriaCount > 20) {
      throw new Error("Le nombre de critères doit être entre 0 et 20");
    }
    
    // Vérifier que le sous-domaine existe
    const subdomain = await ctx.db.get(subdomainId);
    if (!subdomain || subdomain.deleted) {
      throw new Error("Sous-domaine introuvable");
    }
    
    const now = Date.now();
    const taskIds: string[] = [];
    
    // Créer les critères vides
    const emptyCriteria = [];
    for (let j = 1; j <= criteriaCount; j++) {
      emptyCriteria.push({
        title: `Critère ${j}`,
        videoUrl: "",
      });
    }
    
    // Créer les tâches vides
    for (let i = 1; i <= count; i++) {
      const taskId = await ctx.db.insert("tasks", {
        title: `${prefix.trim()}${i}`,
        videoUrl: "",
        description: "",
        baseline: "",
        technicalDetails: "",
        resourceIds: [],
        subdomainId: subdomainId,
        criteria: emptyCriteria,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        deleted: false,
      });
      
      taskIds.push(taskId);
    }
    
    return { 
      success: true, 
      count: taskIds.length,
      taskIds 
    };
  },
});
