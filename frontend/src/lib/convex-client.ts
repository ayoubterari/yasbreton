import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL n'est pas défini dans .env.local");
}

// Client HTTP Convex pour les appels API
export const convexClient = new ConvexHttpClient(CONVEX_URL);

// Types pour nos données
export interface UserPermissions {
  dashboard: boolean;
  users: boolean;
  domains: boolean;
  tasks: boolean;
  formations: boolean;
  resources: boolean;
  settings: boolean;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'user' | 'admin' | 'restricted';
  isPremium?: boolean;
  premiumExpiresAt?: number;
  subscriptionType?: 'monthly' | 'quarterly' | 'yearly';
  permissions?: UserPermissions;
  createdAt: number;
}

export interface Category {
  _id: string;
  nameFr: string;
  nameAr: string;
  descriptionFr?: string;
  descriptionAr?: string;
  parentId?: string;
  order: number;
  createdAt: number;
  deleted?: boolean;
}

export interface FileResource {
  _id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  categories: string[];
  tags: string[];
  type: "free" | "premium";
  fileUrl: string;
  storageId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface Domain {
  _id: string;
  name: string;
  description?: string;
  order: number;
  createdAt: number;
  deleted?: boolean;
}

export interface Subdomain {
  _id: string;
  name: string;
  description?: string;
  domainId: string;
  order: number;
  createdAt: number;
  deleted?: boolean;
}

export interface TaskCriterion {
  title: string;
  videoUrl: string;
  description?: string;
  baseline?: string;
  technicalDetails?: string;
  resourceIds?: string[];
}

export interface Task {
  _id: string;
  title: string;
  videoUrl: string;
  description: string;
  baseline: string;
  technicalDetails: string;
  resources?: string;
  resourceIds?: string[];
  subdomainId?: string;
  criteria?: TaskCriterion[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface Formation {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  previewVideoUrl?: string;
  category: string;
  level: "debutant" | "intermediaire" | "avance";
  duration: number;
  price: number;
  isPremium: boolean;
  instructor: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  published?: boolean;
  deleted?: boolean;
}

export interface FormationSection {
  _id: string;
  formationId: string;
  title: string;
  order: number;
  createdAt: number;
  deleted?: boolean;
}

export interface FormationLesson {
  _id: string;
  sectionId: string;
  formationId: string;
  title: string;
  description?: string;
  lessonType?: "video" | "resource";
  videoUrl?: string;
  resourceId?: string;
  duration: number;
  order: number;
  isFree?: boolean;
  createdAt: number;
  deleted?: boolean;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// API Functions
export const api = {
  auth: {
    // Inscription
    register: async (data: RegisterData): Promise<User> => {
      return await convexClient.mutation("auth:register" as any, data);
    },
    
    // Connexion
    login: async (data: LoginData): Promise<User> => {
      return await convexClient.mutation("auth:login" as any, data);
    },
    
    // Récupérer un utilisateur par ID
    getUserById: async (userId: string): Promise<User | null> => {
      return await convexClient.query("auth:getUserById" as any, { userId });
    },
    
    // Vérifier si un email existe
    checkEmailExists: async (email: string): Promise<boolean> => {
      return await convexClient.query("auth:checkEmailExists" as any, { email });
    },
    
    // Mettre à jour le profil
    updateProfile: async (userId: string, data: { nom: string; prenom: string; telephone: string }): Promise<User> => {
      return await convexClient.mutation("auth:updateProfile" as any, { userId, ...data });
    },
    
    // Changer le mot de passe
    changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("auth:changePassword" as any, { userId, currentPassword, newPassword });
    },
  },
  
  admin: {
    // Récupérer tous les utilisateurs
    getAllUsers: async (adminId: string): Promise<User[]> => {
      return await convexClient.query("admin:getAllUsers" as any, { adminId });
    },
    
    // Supprimer un utilisateur
    deleteUser: async (adminId: string, userId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("admin:deleteUser" as any, { adminId, userId });
    },
    
    // Changer le rôle d'un utilisateur
    changeUserRole: async (adminId: string, userId: string, newRole: "user" | "admin"): Promise<{ success: boolean }> => {
      return await convexClient.mutation("admin:changeUserRole" as any, { adminId, userId, newRole });
    },

    // Mettre à jour un utilisateur
    updateUser: async (adminId: string, userId: string, data: { nom: string; prenom: string; email: string; telephone: string }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("admin:updateUser" as any, { adminId, userId, ...data });
    },
    
    // Créer un compte admin
    createAdmin: async (data: RegisterData): Promise<User> => {
      return await convexClient.mutation("admin:createAdmin" as any, data);
    },

    // Créer un utilisateur restreint avec permissions
    createRestrictedUser: async (data: RegisterData & { permissions: UserPermissions; createdBy: string }): Promise<User> => {
      return await convexClient.mutation("admin:createRestrictedUser" as any, data);
    },

    // Mettre à jour les permissions d'un utilisateur
    updateUserPermissions: async (adminId: string, userId: string, permissions: UserPermissions): Promise<{ success: boolean }> => {
      return await convexClient.mutation("admin:updateUserPermissions" as any, { adminId, userId, permissions });
    },
  },

  categories: {
    create: async (data: { nameFr: string; nameAr: string; descriptionFr?: string; descriptionAr?: string; parentId?: string }): Promise<string> => {
      return await convexClient.mutation("categories:createCategory" as any, data);
    },
    getAll: async (): Promise<Category[]> => {
      return await convexClient.query("categories:getCategories" as any);
    },
    getRoots: async (): Promise<Category[]> => {
      return await convexClient.query("categories:getRootCategories" as any);
    },
    getChildren: async (parentId: string): Promise<Category[]> => {
      return await convexClient.query("categories:getSubCategories" as any, { parentId });
    },
    update: async (data: { categoryId: string; nameFr: string; nameAr: string; descriptionFr?: string; descriptionAr?: string; parentId?: string }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("categories:updateCategory" as any, data);
    },
    delete: async (categoryId: string, deleteChildren: boolean): Promise<{ success: boolean }> => {
      return await convexClient.mutation("categories:deleteCategory" as any, { categoryId, deleteChildren });
    },
    reorder: async (categoryId: string, newOrder: number, parentId?: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("categories:reorderCategories" as any, { categoryId, newOrder, parentId });
    },
    getPath: async (categoryId: string): Promise<Array<{ _id: string; nameFr: string; nameAr: string }>> => {
      return await convexClient.query("categories:getCategoryPath" as any, { categoryId });
    },
  },

  tags: {
    create: async (name: string): Promise<string> => {
      return await convexClient.mutation("tags:createTag" as any, { name });
    },
    getAll: async (): Promise<Array<{ _id: string; name: string; createdAt: number }>> => {
      return await convexClient.query("tags:getAllTags" as any);
    },
    update: async (tagId: string, name: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("tags:updateTag" as any, { tagId, name });
    },
    delete: async (tagId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("tags:deleteTag" as any, { tagId });
    },
    getUsage: async (tagId: string): Promise<{ count: number; files: Array<{ _id: string; titleFr: string }> }> => {
      return await convexClient.query("tags:getTagUsage" as any, { tagId });
    },
    search: async (search: string): Promise<Array<{ _id: string; name: string; createdAt: number }>> => {
      return await convexClient.query("tags:searchTags" as any, { search });
    },
  },

  premium: {
    upgradeToPremium: async (data: { userId: string; subscriptionType: 'monthly' | 'quarterly' | 'yearly' }): Promise<{ success: boolean; expiresAt: number }> => {
      return await convexClient.mutation("premium:upgradeToPremium" as any, data);
    },
    cancelPremium: async (userId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("premium:cancelPremium" as any, { userId });
    },
  },

  files: {
    // Catégories (deprecated - use categories.* instead)
    createCategory: async (data: { nameFr: string; nameAr: string; descriptionFr?: string; descriptionAr?: string }): Promise<string> => {
      return await convexClient.mutation("categories:createCategory" as any, data);
    },
    getCategories: async (): Promise<Category[]> => {
      return await convexClient.query("categories:getCategories" as any);
    },

    // Tags
    getTags: async (): Promise<string[]> => {
      return await convexClient.query("files:getTags" as any);
    },
    searchTags: async (search: string): Promise<string[]> => {
      return await convexClient.query("files:searchTags" as any, { search });
    },

    // Fichiers
    createFile: async (data: {
      titleFr: string;
      titleAr: string;
      descriptionFr: string;
      descriptionAr: string;
      categories: string[];
      tags: string[];
      type: "free" | "premium";
      fileUrl: string;
      storageId?: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedBy: string;
    }): Promise<string> => {
      return await convexClient.mutation("files:createFile" as any, data);
    },

    getFiles: async (): Promise<FileResource[]> => {
      return await convexClient.query("files:getFiles" as any);
    },

    getFileById: async (fileId: string): Promise<FileResource | null> => {
      return await convexClient.query("files:getFileById" as any, { fileId });
    },

    updateFile: async (data: {
      fileId: string;
      titleFr: string;
      titleAr: string;
      descriptionFr: string;
      descriptionAr: string;
      categories: string[];
      tags: string[];
      type: "free" | "premium";
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("files:updateFile" as any, data);
    },

    deleteFile: async (fileId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("files:deleteFile" as any, { fileId });
    },

    filterFiles: async (filters: {
      type?: "free" | "premium";
      categoryId?: string;
      tag?: string;
    }): Promise<FileResource[]> => {
      return await convexClient.query("files:filterFiles" as any, filters);
    },

    // Storage
    generateUploadUrl: async (): Promise<string> => {
      return await convexClient.mutation("files:generateUploadUrl" as any);
    },
    getFileUrl: async (storageId: string): Promise<string | null> => {
      return await convexClient.query("files:getFileUrl" as any, { storageId });
    },
  },

  statistics: {
    trackDownload: async (fileId: string, userId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("statistics:trackDownload" as any, { fileId, userId });
    },
    getDownloadStats: async (): Promise<Array<{
      file: { _id: string; titleFr: string; titleAr: string; type: string };
      totalDownloads: number;
      downloads: Array<{
        userId: string;
        userName: string;
        userEmail: string;
        downloadedAt: number;
      }>;
    }>> => {
      return await convexClient.query("statistics:getDownloadStats" as any);
    },
    getFileDownloadStats: async (fileId: string): Promise<{
      file: { _id: string; titleFr: string; titleAr: string; type: string };
      totalDownloads: number;
      downloads: Array<{
        userId: string;
        userName: string;
        userEmail: string;
        downloadedAt: number;
      }>;
    } | null> => {
      return await convexClient.query("statistics:getFileDownloadStats" as any, { fileId });
    },
    getPremiumConversions: async (): Promise<Array<{
      conversionId: string;
      userId: string;
      userName: string;
      userEmail: string;
      subscriptionType: string;
      convertedAt: number;
      expiresAt: number;
      isActive: boolean;
    }>> => {
      return await convexClient.query("statistics:getPremiumConversions" as any);
    },
    getGeneralStats: async (): Promise<{
      users: { total: number; premium: number; regular: number };
      files: { total: number; free: number; premium: number };
      downloads: { total: number; free: number; premium: number };
      conversions: { total: number };
    }> => {
      return await convexClient.query("statistics:getGeneralStats" as any);
    },
  },

  domains: {
    // Créer un domaine
    createDomain: async (data: {
      name: string;
      description?: string;
      order: number;
    }): Promise<string> => {
      return await convexClient.mutation("domains:createDomain" as any, data);
    },

    // Obtenir tous les domaines
    getAllDomains: async (): Promise<Domain[]> => {
      return await convexClient.query("domains:getAllDomains" as any);
    },

    // Obtenir un domaine par ID
    getDomainById: async (domainId: string): Promise<Domain | null> => {
      return await convexClient.query("domains:getDomainById" as any, { domainId });
    },

    // Mettre à jour un domaine
    updateDomain: async (data: {
      domainId: string;
      name?: string;
      description?: string;
      order?: number;
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("domains:updateDomain" as any, data);
    },

    // Supprimer un domaine
    deleteDomain: async (domainId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("domains:deleteDomain" as any, { domainId });
    },

    // Créer un sous-domaine
    createSubdomain: async (data: {
      name: string;
      description?: string;
      domainId: string;
      order: number;
    }): Promise<string> => {
      return await convexClient.mutation("domains:createSubdomain" as any, data);
    },

    // Obtenir les sous-domaines d'un domaine
    getSubdomainsByDomain: async (domainId: string): Promise<Subdomain[]> => {
      return await convexClient.query("domains:getSubdomainsByDomain" as any, { domainId });
    },

    // Obtenir tous les sous-domaines
    getAllSubdomains: async (): Promise<Subdomain[]> => {
      return await convexClient.query("domains:getAllSubdomains" as any);
    },

    // Mettre à jour un sous-domaine
    updateSubdomain: async (data: {
      subdomainId: string;
      name?: string;
      description?: string;
      domainId?: string;
      order?: number;
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("domains:updateSubdomain" as any, data);
    },

    // Supprimer un sous-domaine
    deleteSubdomain: async (subdomainId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("domains:deleteSubdomain" as any, { subdomainId });
    },
  },

  tasks: {
    // Créer une tâche
    createTask: async (data: {
      title: string;
      videoUrl: string;
      description: string;
      baseline: string;
      technicalDetails: string;
      resources?: string;
      resourceIds?: string[];
      subdomainId?: string;
      criteria?: TaskCriterion[];
      userId: string;
    }): Promise<string> => {
      return await convexClient.mutation("tasks:createTask" as any, data);
    },

    // Obtenir toutes les tâches
    getAllTasks: async (): Promise<Task[]> => {
      return await convexClient.query("tasks:getAllTasks" as any);
    },

    // Obtenir une tâche par ID
    getTaskById: async (taskId: string): Promise<Task | null> => {
      return await convexClient.query("tasks:getTaskById" as any, { taskId });
    },

    // Mettre à jour une tâche
    updateTask: async (data: {
      taskId: string;
      title?: string;
      videoUrl?: string;
      description?: string;
      baseline?: string;
      technicalDetails?: string;
      resources?: string;
      resourceIds?: string[];
      subdomainId?: string;
      criteria?: TaskCriterion[];
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("tasks:updateTask" as any, data);
    },

    // Obtenir les tâches par sous-domaine
    getTasksBySubdomain: async (subdomainId: string): Promise<Task[]> => {
      return await convexClient.query("tasks:getTasksBySubdomain" as any, { subdomainId });
    },

    // Supprimer une tâche
    deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("tasks:deleteTask" as any, { taskId });
    },

    // Obtenir les tâches par utilisateur
    getTasksByUser: async (userId: string): Promise<Task[]> => {
      return await convexClient.query("tasks:getTasksByUser" as any, { userId });
    },

    // Obtenir les statistiques des tâches
    getTasksStats: async (): Promise<{
      total: number;
      active: number;
      deleted: number;
    }> => {
      return await convexClient.query("tasks:getTasksStats" as any);
    },

    // Générer automatiquement plusieurs tâches vides
    generateEmptyTasks: async (data: {
      subdomainId: string;
      count: number;
      prefix: string;
      criteriaCount: number;
      userId: string;
    }): Promise<{ success: boolean; count: number; taskIds: string[] }> => {
      return await convexClient.mutation("tasks:generateEmptyTasks" as any, data);
    },
  },

  formations: {
    // Créer une formation
    createFormation: async (data: {
      title: string;
      description: string;
      thumbnail?: string;
      category: string;
      level: "debutant" | "intermediaire" | "avance";
      duration: number;
      price: number;
      isPremium: boolean;
      instructor: string;
      userId: string;
    }): Promise<string> => {
      return await convexClient.mutation("formations:createFormation" as any, data);
    },

    // Obtenir toutes les formations
    getAllFormations: async (): Promise<Formation[]> => {
      return await convexClient.query("formations:getAllFormations" as any);
    },

    // Obtenir une formation par ID
    getFormationById: async (formationId: string): Promise<Formation | null> => {
      return await convexClient.query("formations:getFormationById" as any, { formationId });
    },

    // Mettre à jour une formation
    updateFormation: async (data: {
      formationId: string;
      title?: string;
      description?: string;
      thumbnail?: string;
      category?: string;
      level?: "debutant" | "intermediaire" | "avance";
      duration?: number;
      price?: number;
      isPremium?: boolean;
      instructor?: string;
      published?: boolean;
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("formations:updateFormation" as any, data);
    },

    // Supprimer une formation
    deleteFormation: async (formationId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("formations:deleteFormation" as any, { formationId });
    },

    // Créer une section
    createSection: async (data: {
      formationId: string;
      title: string;
      order: number;
    }): Promise<string> => {
      return await convexClient.mutation("formations:createSection" as any, data);
    },

    // Obtenir les sections d'une formation
    getSectionsByFormation: async (formationId: string): Promise<FormationSection[]> => {
      return await convexClient.query("formations:getSectionsByFormation" as any, { formationId });
    },

    // Mettre à jour une section
    updateSection: async (data: {
      sectionId: string;
      title?: string;
      order?: number;
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("formations:updateSection" as any, data);
    },

    // Supprimer une section
    deleteSection: async (sectionId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("formations:deleteSection" as any, { sectionId });
    },

    // Créer une leçon
    createLesson: async (data: {
      sectionId: string;
      formationId: string;
      title: string;
      description?: string;
      lessonType?: "video" | "resource";
      videoUrl?: string;
      resourceId?: string;
      duration: number;
      order: number;
      isFree?: boolean;
    }): Promise<string> => {
      return await convexClient.mutation("formations:createLesson" as any, data);
    },

    // Obtenir les leçons d'une section
    getLessonsBySection: async (sectionId: string): Promise<FormationLesson[]> => {
      return await convexClient.query("formations:getLessonsBySection" as any, { sectionId });
    },

    // Obtenir toutes les leçons d'une formation
    getLessonsByFormation: async (formationId: string): Promise<FormationLesson[]> => {
      return await convexClient.query("formations:getLessonsByFormation" as any, { formationId });
    },

    // Mettre à jour une leçon
    updateLesson: async (data: {
      lessonId: string;
      title?: string;
      description?: string;
      lessonType?: "video" | "resource";
      videoUrl?: string;
      resourceId?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
    }): Promise<{ success: boolean }> => {
      return await convexClient.mutation("formations:updateLesson" as any, data);
    },

    // Supprimer une leçon
    deleteLesson: async (lessonId: string): Promise<{ success: boolean }> => {
      return await convexClient.mutation("formations:deleteLesson" as any, { lessonId });
    },

    // Inscrire un utilisateur à une formation
    enrollUser: async (data: {
      userId: string;
      formationId: string;
    }): Promise<{ success: boolean; enrollmentId?: string; alreadyEnrolled: boolean }> => {
      return await convexClient.mutation("formations:enrollUser" as any, data);
    },

    // Vérifier si un utilisateur est inscrit à une formation
    isUserEnrolled: async (data: {
      userId: string;
      formationId: string;
    }): Promise<boolean> => {
      return await convexClient.query("formations:isUserEnrolled" as any, data);
    },

    // Obtenir toutes les inscriptions d'un utilisateur
    getUserEnrollments: async (userId: string): Promise<any[]> => {
      return await convexClient.query("formations:getUserEnrollments" as any, { userId });
    },

    // Obtenir les statistiques d'inscription d'une formation
    getFormationEnrollmentStats: async (formationId: string): Promise<{
      totalEnrollments: number;
      freeEnrollments: number;
      paidEnrollments: number;
      enrollments: Array<{
        enrollmentId: string;
        enrolledAt: number;
        paymentStatus?: "free" | "paid";
        user: {
          id: string;
          nom: string;
          prenom: string;
          email: string;
          isPremium?: boolean;
        } | null;
      }>;
    }> => {
      return await convexClient.query("formations:getFormationEnrollmentStats" as any, { formationId });
    },
  },
};
