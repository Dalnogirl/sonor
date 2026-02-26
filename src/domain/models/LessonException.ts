export class LessonException {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly originalDate: Date,
    public readonly createdAt: Date = new Date()
  ) {}

  static skip(lessonId: string, originalDate: Date): LessonException {
    return new LessonException(
      crypto.randomUUID(),
      lessonId,
      originalDate
    );
  }

  appliesTo(date: Date): boolean {
    return this.originalDate.getTime() === date.getTime();
  }
}
