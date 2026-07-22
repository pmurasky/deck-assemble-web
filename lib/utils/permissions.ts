/**
 * Checks if the given Auth0 user has the 'admin' role.
 * Since the exact namespace isn't fixed, this checks common claim patterns.
 */
export function isAdmin(user: Record<string, unknown> | null | undefined): boolean {
  if (!user) return false;
  console.log('[DEBUG] Auth0 user claims:', user);

  // Email fallback check (e.g. peter.murasky)
  const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
  const nickname = typeof user.nickname === 'string' ? user.nickname.toLowerCase() : '';
  const name = typeof user.name === 'string' ? user.name.toLowerCase() : '';

  if (
    email.includes('peter.murasky') ||
    nickname.includes('peter.murasky') ||
    name.includes('peter murasky') ||
    email.endsWith('@deckassemble.app')
  ) {
    return true;
  }

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

