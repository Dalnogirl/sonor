import { User } from '@/domain/models/User';

export type UserSummaryDTO = Pick<User, 'id' | 'name' | 'email'>;
