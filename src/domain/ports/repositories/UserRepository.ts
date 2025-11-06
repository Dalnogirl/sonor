import { PaginationParams } from '@/domain/models/PaginationParams';
import { User } from '@/domain/models/User';
export interface UserFindAllProps {
  page?: number;
  pageSize?: number;
}
export interface UserRepository {
  findAll(paginationParams: PaginationParams): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByIds(ids: string[]): Promise<User[]>;
}
