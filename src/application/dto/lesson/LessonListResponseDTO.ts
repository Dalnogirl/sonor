import { LessonResponseWithPermissionsDTO } from './LessonResponseWithPermissionsDTO';

export interface LessonListResponseDTO {
  lessons: LessonResponseWithPermissionsDTO[];
  canCreate: boolean;
}
