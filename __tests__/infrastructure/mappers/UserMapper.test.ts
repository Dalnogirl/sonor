import { describe, it, expect } from 'vitest';
import { UserMapper } from '@/infrastructure/mappers/UserMapper';
import { User } from '@/domain/models/User';

describe('UserMapper', () => {
  // Create mapper instance for each test
  const mapper = new UserMapper();

  describe('toResponseDTO', () => {
    it('should map User entity to UserResponseDTO', () => {
      // Arrange
      const user = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        'hashed-password-secret', // Sensitive data!
        true
      );

      // Act
      const dto = mapper.toResponseDTO(user);

      // Assert - Should include all safe fields
      expect(dto).toEqual({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        isEmailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
    });

    it('should NOT include password in DTO', () => {
      // Arrange
      const user = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        new Date(),
        new Date(),
        'super-secret-password',
        false
      );

      // Act
      const dto = mapper.toResponseDTO(user);

      // Assert - Critical security test!
      expect(dto).not.toHaveProperty('password');
      expect(Object.keys(dto)).not.toContain('password');
    });
  });

  describe('toResponseDTOArray', () => {
    it('should map array of Users to array of DTOs', () => {
      // Arrange
      const users = [
        User.createWithDefaults('1', 'Alice', 'alice@example.com', 'pass1'),
        User.createWithDefaults('2', 'Bob', 'bob@example.com', 'pass2'),
        User.createWithDefaults('3', 'Charlie', 'charlie@example.com', 'pass3'),
      ];

      // Act
      const dtos = mapper.toResponseDTOArray(users);

      // Assert
      expect(dtos).toHaveLength(3);
      expect(dtos[0]).toMatchObject({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      });
      expect(dtos[1]).toMatchObject({
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
      });
      expect(dtos[2]).toMatchObject({
        id: '3',
        name: 'Charlie',
        email: 'charlie@example.com',
      });

      // Security check - none should have password
      dtos.forEach((dto) => {
        expect(dto).not.toHaveProperty('password');
      });
    });

    it('should return empty array for empty input', () => {
      expect(mapper.toResponseDTOArray([])).toEqual([]);
    });
  });

  describe('toSummaryDTO', () => {
    it('should map User to minimal summary DTO', () => {
      // Arrange
      const user = User.createWithDefaults(
        'user-123',
        'John Doe',
        'john@example.com',
        'password'
      );

      // Act
      const summary = mapper.toSummaryDTO(user);

      // Assert - Should only include minimal fields
      expect(summary).toEqual({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      });

      // Should NOT include timestamp fields
      expect(summary).not.toHaveProperty('createdAt');
      expect(summary).not.toHaveProperty('updatedAt');
      expect(summary).not.toHaveProperty('isEmailVerified');
    });
  });
});
