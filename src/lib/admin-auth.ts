// Simple admin authentication utility
export function isAdminAuthenticated(password: string): boolean {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  return ADMIN_PASSWORD ? password === ADMIN_PASSWORD : false;
}

// Hash function for filenames (using crypto.randomUUID as a simple placeholder)
export function hashFilename(filename: string): string {
  // In a real application, you'd use a proper hashing algorithm like SHA-256
  // For now, we'll use crypto.randomUUID as a placeholder
  return crypto.randomUUID();
}