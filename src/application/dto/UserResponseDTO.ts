import { UserRole } from '@/domain/models/UserRole';

/**
 * User Response DTO
 * Safe representation of user data for external exposure
 * Never includes sensitive data like passwords
 */
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
