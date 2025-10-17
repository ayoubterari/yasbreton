import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Enregistrer un téléchargement
export const trackDownload = mutation({
  args: {
    fileId: v.id("files"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("downloads", {
      fileId: args.fileId,
      userId: args.userId,
      downloadedAt: Date.now(),
    });

    return { success: true };
  },
});

// Obtenir les statistiques de téléchargement par fichier
export const getDownloadStats = query({
  args: {},
  handler: async (ctx) => {
    const downloads = await ctx.db.query("downloads").collect();
    const files = await ctx.db.query("files").filter((q) => q.neq(q.field("deleted"), true)).collect();
    
    // Grouper les téléchargements par fichier
    const statsMap = new Map<string, { file: any; downloads: any[] }>();
    
    for (const file of files) {
      statsMap.set(file._id, {
        file: {
          _id: file._id,
          titleFr: file.titleFr,
          titleAr: file.titleAr,
          type: file.type,
        },
        downloads: [],
      });
    }
    
    // Ajouter les téléchargements avec les infos utilisateur
    for (const download of downloads) {
      const stat = statsMap.get(download.fileId);
      if (stat) {
        const user = await ctx.db.get(download.userId);
        if (user) {
          stat.downloads.push({
            userId: user._id,
            userName: `${user.prenom} ${user.nom}`,
            userEmail: user.email,
            downloadedAt: download.downloadedAt,
          });
        }
      }
    }
    
    // Convertir en tableau et trier par nombre de téléchargements
    const stats = Array.from(statsMap.values())
      .map((stat) => ({
        file: stat.file,
        totalDownloads: stat.downloads.length,
        downloads: stat.downloads.sort((a, b) => b.downloadedAt - a.downloadedAt),
      }))
      .sort((a, b) => b.totalDownloads - a.totalDownloads);
    
    return stats;
  },
});

// Obtenir les statistiques de téléchargement pour un fichier spécifique
export const getFileDownloadStats = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return null;
    }

    const downloads = await ctx.db
      .query("downloads")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .collect();

    const downloadDetails = [];
    for (const download of downloads) {
      const user = await ctx.db.get(download.userId);
      if (user) {
        downloadDetails.push({
          userId: user._id,
          userName: `${user.prenom} ${user.nom}`,
          userEmail: user.email,
          downloadedAt: download.downloadedAt,
        });
      }
    }

    return {
      file: {
        _id: file._id,
        titleFr: file.titleFr,
        titleAr: file.titleAr,
        type: file.type,
      },
      totalDownloads: downloads.length,
      downloads: downloadDetails.sort((a, b) => b.downloadedAt - a.downloadedAt),
    };
  },
});

// Obtenir les conversions premium
export const getPremiumConversions = query({
  args: {},
  handler: async (ctx) => {
    const conversions = await ctx.db
      .query("premiumConversions")
      .order("desc")
      .collect();

    const conversionsWithUsers = [];
    for (const conversion of conversions) {
      const user = await ctx.db.get(conversion.userId);
      if (user) {
        conversionsWithUsers.push({
          conversionId: conversion._id,
          userId: user._id,
          userName: `${user.prenom} ${user.nom}`,
          userEmail: user.email,
          subscriptionType: conversion.subscriptionType,
          convertedAt: conversion.convertedAt,
          expiresAt: conversion.expiresAt,
          isActive: user.isPremium || false,
        });
      }
    }

    return conversionsWithUsers;
  },
});

// Obtenir les statistiques générales
export const getGeneralStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const files = await ctx.db.query("files").filter((q) => q.neq(q.field("deleted"), true)).collect();
    const downloads = await ctx.db.query("downloads").collect();
    const conversions = await ctx.db.query("premiumConversions").collect();

    const totalUsers = users.length;
    const premiumUsers = users.filter((u) => u.isPremium).length;
    const regularUsers = totalUsers - premiumUsers;
    const totalFiles = files.length;
    const freeFiles = files.filter((f) => f.type === "free").length;
    const premiumFiles = files.filter((f) => f.type === "premium").length;
    const totalDownloads = downloads.length;
    const totalConversions = conversions.length;

    // Calculer les téléchargements par type de fichier
    let freeDownloads = 0;
    let premiumDownloads = 0;

    for (const download of downloads) {
      const file = await ctx.db.get(download.fileId);
      if (file) {
        if (file.type === "free") {
          freeDownloads++;
        } else if (file.type === "premium") {
          premiumDownloads++;
        }
      }
    }

    return {
      users: {
        total: totalUsers,
        premium: premiumUsers,
        regular: regularUsers,
      },
      files: {
        total: totalFiles,
        free: freeFiles,
        premium: premiumFiles,
      },
      downloads: {
        total: totalDownloads,
        free: freeDownloads,
        premium: premiumDownloads,
      },
      conversions: {
        total: totalConversions,
      },
    };
  },
});
