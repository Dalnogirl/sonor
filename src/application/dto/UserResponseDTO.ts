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
  createdAt: Date;
  updatedAt: Date;
}
