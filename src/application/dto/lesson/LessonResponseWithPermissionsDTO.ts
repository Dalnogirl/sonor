import { LessonResponseDTO } from './LessonResponseDTO';
import { LessonPermissions } from './LessonPermissions';

export type LessonResponseWithPermissionsDTO = LessonResponseDTO & {
  permissions: LessonPermissions;
};
