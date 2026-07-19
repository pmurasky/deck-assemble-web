/**
 * Checks if the given Auth0 user has the 'admin' role.
 * Since the exact namespace isn't fixed, this checks common claim patterns.
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;

  // Sometimes roles are at the top level
  if (Array.isArray(user.roles) && user.roles.includes('admin')) {
    return true;
  }
  
  if (user.role === 'admin') {
    return true;
  }

  // Check custom namespaces
  for (const key of Object.keys(user)) {
    if (key.includes('role') || key.includes('roles')) {
      const value = user[key];
      if (Array.isArray(value) && value.includes('admin')) {
        return true;
      }
      if (typeof value === 'string' && value === 'admin') {
        return true;
      }
    }
  }

  return false;
}
