import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    nom: v.string(),
    prenom: v.string(),
    email: v.string(),
    password: v.string(), // En production, utilisez un hash (bcrypt)
    telephone: v.string(),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("restricted")), // user, admin ou restricted
    isPremium: v.optional(v.boolean()), // Statut premium
    premiumExpiresAt: v.optional(v.number()), // Date d'expiration de l'abonnement
    subscriptionType: v.optional(v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("yearly"))),
    permissions: v.optional(v.object({
      dashboard: v.boolean(),
      users: v.boolean(),
      domains: v.boolean(),
      tasks: v.boolean(),
      formations: v.boolean(),
      resources: v.boolean(),
      settings: v.boolean(),
    })),
    createdBy: v.optional(v.id("users")), // ID de l'admin qui a créé l'utilisateur restreint
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Catégories de fichiers
  categories: defineTable({
    nameFr: v.string(),
    nameAr: v.string(),
    descriptionFr: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    parentId: v.optional(v.id("categories")), // Catégorie parente
    order: v.number(), // Ordre d'affichage
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_parent", ["parentId"])
    .index("by_deleted", ["deleted"]),

  // Tags
  tags: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Fichiers
  files: defineTable({
    titleFr: v.string(),
    titleAr: v.string(),
    descriptionFr: v.string(),
    descriptionAr: v.string(),
    categories: v.array(v.id("categories")), // IDs des catégories
    tags: v.array(v.string()), // Noms des tags
    type: v.union(v.literal("free"), v.literal("premium")),
    fileUrl: v.string(), // URL du fichier uploadé (pour compatibilité)
    storageId: v.optional(v.id("_storage")), // ID Convex Storage
    fileName: v.string(),
    fileType: v.string(), // MIME type
    fileSize: v.number(), // en bytes
    uploadedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_deleted", ["deleted"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // Téléchargements de fichiers (tracking)
  downloads: defineTable({
    fileId: v.id("files"),
    userId: v.id("users"),
    downloadedAt: v.number(),
  })
    .index("by_file", ["fileId"])
    .index("by_user", ["userId"])
    .index("by_date", ["downloadedAt"]),

  // Historique des conversions premium
  premiumConversions: defineTable({
    userId: v.id("users"),
    subscriptionType: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("yearly")),
    convertedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["convertedAt"]),

  // Domaines
  domains: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_order", ["order"])
    .index("by_deleted", ["deleted"]),

  // Sous-domaines
  subdomains: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    domainId: v.id("domains"),
    order: v.number(),
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_domain", ["domainId"])
    .index("by_order", ["order"])
    .index("by_deleted", ["deleted"]),

  // Formations
  formations: defineTable({
    title: v.string(),
    description: v.string(),
    thumbnail: v.optional(v.string()),
    previewVideoUrl: v.optional(v.string()), // Vidéo de présentation YouTube
    category: v.string(), // Ex: "Guidance parentale", "ABA", etc.
    level: v.union(v.literal("debutant"), v.literal("intermediaire"), v.literal("avance")),
    duration: v.number(), // Durée totale en minutes
    price: v.number(), // Prix en euros (0 pour gratuit)
    isPremium: v.boolean(),
    instructor: v.string(), // Nom de l'instructeur
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    published: v.optional(v.boolean()),
    deleted: v.optional(v.boolean()),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_category", ["category"])
    .index("by_published", ["published"])
    .index("by_deleted", ["deleted"]),

  // Sections de formation (chapitres)
  formationSections: defineTable({
    formationId: v.id("formations"),
    title: v.string(),
    order: v.number(),
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_formation", ["formationId"])
    .index("by_order", ["order"]),

  // Leçons (vidéos ou ressources)
  formationLessons: defineTable({
    sectionId: v.id("formationSections"),
    formationId: v.id("formations"),
    title: v.string(),
    description: v.optional(v.string()),
    lessonType: v.optional(v.union(v.literal("video"), v.literal("resource"))), // Type de leçon
    videoUrl: v.optional(v.string()), // URL vidéo (si type = video)
    resourceId: v.optional(v.id("files")), // ID de la ressource (si type = resource)
    duration: v.number(), // Durée en minutes
    order: v.number(),
    isFree: v.optional(v.boolean()), // Leçon gratuite accessible sans abonnement
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_section", ["sectionId"])
    .index("by_formation", ["formationId"])
    .index("by_order", ["order"])
    .index("by_resource", ["resourceId"]),

  // Inscriptions aux formations
  formationEnrollments: defineTable({
    userId: v.id("users"),
    formationId: v.id("formations"),
    enrolledAt: v.number(),
    paymentStatus: v.optional(v.union(v.literal("paid"), v.literal("free"))), // Statut du paiement
  })
    .index("by_user", ["userId"])
    .index("by_formation", ["formationId"])
    .index("by_user_formation", ["userId", "formationId"]),

  // Progression des utilisateurs
  formationProgress: defineTable({
    userId: v.id("users"),
    formationId: v.id("formations"),
    lessonId: v.id("formationLessons"),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    lastWatchedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_formation", ["formationId"])
    .index("by_user_formation", ["userId", "formationId"]),

  // Tâches
  tasks: defineTable({
    title: v.string(),
    videoUrl: v.string(),
    description: v.string(),
    baseline: v.string(),
    technicalDetails: v.string(),
    resources: v.optional(v.string()), // Ancien champ pour compatibilité
    resourceIds: v.optional(v.array(v.id("files"))), // IDs des fichiers/ressources
    subdomainId: v.optional(v.id("subdomains")), // Sous-domaine auquel la tâche appartient
    criteria: v.optional(v.array(v.object({
      title: v.string(),
      videoUrl: v.string(),
      description: v.optional(v.string()),
      baseline: v.optional(v.string()),
      technicalDetails: v.optional(v.string()),
      resourceIds: v.optional(v.array(v.id("files"))),
    }))),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_deleted", ["deleted"])
    .index("by_createdAt", ["createdAt"])
    .index("by_subdomain", ["subdomainId"]),
});
