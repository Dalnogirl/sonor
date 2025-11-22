export interface DateService {
  addDays(date: Date, days: number): Date;
  addWeeks(date: Date, weeks: number): Date;
  addMonths(date: Date, months: number): Date;
  startOfWeek(date: Date): Date;
  daysInMonth(date: Date): number;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  isSameOrBefore(date1: Date, date2: Date): boolean;
  isSameOrAfter(date1: Date, date2: Date): boolean;
}
