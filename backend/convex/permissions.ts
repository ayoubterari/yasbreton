import { Doc } from "./_generated/dataModel";

/**
 * Vérifie si un utilisateur a la permission d'accéder à un module
 */
export function hasPermission(
  user: Doc<"users">,
  module: "dashboard" | "users" | "domains" | "tasks" | "formations" | "resources" | "settings"
): boolean {
  // Les admins ont accès à tout
  if (user.role === "admin") {
    return true;
  }

  // Les utilisateurs restreints doivent avoir la permission spécifique
  if (user.role === "restricted" && user.permissions) {
    return user.permissions[module] === true;
  }

  // Les utilisateurs normaux n'ont pas accès aux modules admin
  return false;
}

/**
 * Vérifie si un utilisateur est admin
 */
export function isAdmin(user: Doc<"users">): boolean {
  return user.role === "admin";
}

/**
 * Vérifie si un utilisateur est admin ou a une permission spécifique
 */
export function canAccess(
  user: Doc<"users">,
  module: "dashboard" | "users" | "domains" | "tasks" | "formations" | "resources" | "settings"
): boolean {
  return isAdmin(user) || hasPermission(user, module);
}
