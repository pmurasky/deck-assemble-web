/**
 * Checks if the given Auth0 user has the 'admin' role.
 * Since the exact namespace isn't fixed, this checks common claim patterns.
 */
export function isAdmin(user: Record<string, unknown> | null | undefined): boolean {
  if (!user) return false;
  console.log('[DEBUG] Auth0 user claims:', user);



  // Sometimes roles are at the top level
  if (Array.isArray(user.roles) && user.roles.includes('admin')) {
    return true;
  }
  
  if (user.role === 'admin') {
    return true;
  }

  // Auth0 permissions array
  if (Array.isArray(user.permissions) && (user.permissions.includes('admin') || user.permissions.includes('read:admin'))) {
    return true;
  }

  // Check custom namespaces
  for (const key of Object.keys(user)) {
    if (key.toLowerCase().includes('role') || key.toLowerCase().includes('permission')) {
      const value = user[key];
      if (Array.isArray(value) && (value.includes('admin') || value.includes('read:admin'))) {
        return true;
      }
      if (typeof value === 'string' && value === 'admin') {
        return true;
      }
    }
  }

  return false;
}
