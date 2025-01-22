export const securityPolicy = {
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 // days
  },
  
  sessionPolicy: {
    maxAge: 3600, // 1 hour
    inactivityTimeout: 900, // 15 minutes
    maxConcurrentSessions: 3
  },
  
  rateLimiting: {
    window: 900000, // 15 minutes
    maxRequests: 100,
    blockDuration: 3600000 // 1 hour
  },
  
  encryption: {
    algorithm: 'aes-256-gcm',
    keyRotationInterval: 30 // days
  }
}; 