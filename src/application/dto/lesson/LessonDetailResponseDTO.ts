import { LessonWithUsersResponseDTO } from './LessonWithUsersResponseDTO';
import { LessonPermissions } from './LessonPermissions';

export type LessonDetailResponseDTO = LessonWithUsersResponseDTO & {
  permissions: LessonPermissions;
};
