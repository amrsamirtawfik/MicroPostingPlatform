// Simulated cryptographic utilities
// In production, use bcrypt or argon2

const MOCK_SALT = 'mock_salt_for_demo_';

// Simulate password hashing (in production use bcrypt)
export const hashPassword = async (password: string): Promise<string> => {
  // Simple simulation - in production use proper hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(MOCK_SALT + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Simulate password verification with constant-time comparison
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const candidateHash = await hashPassword(password);
  
  // Constant-time comparison to prevent timing attacks
  if (candidateHash.length !== hash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < candidateHash.length; i++) {
    result |= candidateHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  
  return result === 0;
};

// Dummy hash for user enumeration prevention
export const DUMMY_PASSWORD_HASH = 'a'.repeat(64);

// Generate a mock JWT token
export const generateToken = (userId: string, email: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }));
  const signature = btoa(`mock_signature_${userId}`);
  
  return `${header}.${payload}.${signature}`;
};

// Decode and validate mock JWT
export const verifyToken = (token: string): { userId: string; email: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
};

// Generate unique ID
export const generateId = (): string => {
  return crypto.randomUUID();
};
