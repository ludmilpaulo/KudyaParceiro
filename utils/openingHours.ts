import type { OpeningHourType } from '../services/types';

/** Index 0 = day 1 (Monday), matching the backend OpeningHour.day choices. */
export const WEEK_DAYS_PT = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export function openingHourDayNumber(hour: OpeningHourType): number {
  if (typeof hour.day_number === 'number') return hour.day_number;
  const parsed = Number(hour.day);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 7 ? parsed : 0;
}

export function openingHourDayLabel(hour: OpeningHourType): string {
  const dayNumber = openingHourDayNumber(hour);
  return WEEK_DAYS_PT[dayNumber - 1] ?? String(hour.day);
}

export function sortOpeningHours(hours: OpeningHourType[]): OpeningHourType[] {
  return [...hours].sort(
    (a, b) => openingHourDayNumber(a) - openingHourDayNumber(b) || a.from_hour.localeCompare(b.from_hour),
  );
}
