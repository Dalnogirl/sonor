import { describe, it, expect, beforeEach } from 'vitest';
import { BcryptPasswordHasher } from '@/infrastructure/services/BcryptPasswordHasher';

/**
 * Integration tests for BcryptPasswordHasher
 * Tests the adapter implements PasswordHasher interface correctly
 *
 * We're NOT testing bcrypt itself (that's already tested)
 * We're testing OUR implementation works correctly
 */
describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      // Arrange
      const plainPassword = 'MySecurePassword123!';

      // Act
      const hashed = await hasher.hash(plainPassword);

      // Assert
      expect(hashed).toBeTruthy();
      expect(hashed).not.toBe(plainPassword); // Should be different
      expect(hashed.length).toBeGreaterThan(0);
      expect(hashed).toMatch(/^\$2[aby]\$/); // Bcrypt hash format
    });

    it('should generate different hashes for same password (salt)', async () => {
      // Arrange
      const plainPassword = 'TestPassword123!';

      // Act
      const hash1 = await hasher.hash(plainPassword);
      const hash2 = await hasher.hash(plainPassword);

      // Assert - Different salts = different hashes
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123!';
      const hashed = await hasher.hash(plainPassword);

      // Act
      const isMatch = await hasher.compare(plainPassword, hashed);

      // Assert
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashed = await hasher.hash(plainPassword);

      // Act
      const isMatch = await hasher.compare(wrongPassword, hashed);

      // Assert
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password', async () => {
      // Arrange
      const plainPassword = 'Password123!';
      const hashed = await hasher.hash(plainPassword);

      // Act
      const isMatch = await hasher.compare('', hashed);

      // Assert
      expect(isMatch).toBe(false);
    });
  });

  describe('integration - hash and compare workflow', () => {
    it('should successfully hash and verify password in real workflow', async () => {
      // Arrange - Simulate user registration
      const userPassword = 'UserPassword123!';

      // Act - Registration: hash password
      const hashedPassword = await hasher.hash(userPassword);

      // Act - Login: compare passwords
      const loginAttempt1 = await hasher.compare(userPassword, hashedPassword);
      const loginAttempt2 = await hasher.compare('WrongPass', hashedPassword);

      // Assert
      expect(loginAttempt1).toBe(true); // Correct password
      expect(loginAttempt2).toBe(false); // Wrong password
    });
  });
});
