import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekday from 'dayjs/plugin/weekday';
import { DateService } from '@/domain/ports/services/DateService';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekday);

export class DayjsDateService implements DateService {
  addDays(date: Date, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
  }

  addWeeks(date: Date, weeks: number): Date {
    return dayjs(date).add(weeks, 'week').toDate();
  }

  addMonths(date: Date, months: number): Date {
    return dayjs(date).add(months, 'month').toDate();
  }

  startOfWeek(date: Date): Date {
    return dayjs(date).weekday(0).toDate();
  }

  daysInMonth(date: Date): number {
    return dayjs(date).daysInMonth();
  }

  isBefore(date1: Date, date2: Date): boolean {
    return dayjs(date1).isBefore(date2, 'day');
  }

  isAfter(date1: Date, date2: Date): boolean {
    return dayjs(date1).isAfter(date2, 'day');
  }

  isSameOrBefore(date1: Date, date2: Date): boolean {
    return dayjs(date1).isSameOrBefore(date2, 'day');
  }

  isSameOrAfter(date1: Date, date2: Date): boolean {
    return dayjs(date1).isSameOrAfter(date2, 'day');
  }
}
