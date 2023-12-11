type ISO8601DateString = string;

function buildIsoDateString(
  day1To31: number,
  month1to12: number,
  year: number
): ISO8601DateString {
  function pad(n: number, digits: number) {
    return n.toString().padStart(digits, '0');
  }
  return `${pad(year, 4)}-${pad(month1to12, 2)}-${pad(day1To31, 2)}`;
}

const isValidDate = (
  day: number,
  month: number,
  year: number,
  yearRange = { minYear: 1, maxYear: 9999 }
) => {
  if (year < yearRange.minYear || year > yearRange.maxYear) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return day <= getMaxDayInMonth(month, year);
};

/**
 * Returns true if the passed value represents a valid ISO8601 date string
 */
export const isValidIsoDateString = (value: unknown) => {
  if (typeof value !== 'string') return false;
  const match = value.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return isValidDate(d, m, y);
};

/**
 * Returns true if the specified year is a leap year
 */
export const isLeapYear = (year: number): boolean => {
  // leap years occur in each year that is an integer multiple of 4 (except for years evenly divisible by 100, but not by 400).
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

/**
 * Returns the maximum day value (28, 29, 30 or 31) in a specified month
 */
export const getMaxDayInMonth = (month1to12: number, year: number): number => {
  if (month1to12 < 1 || month1to12 > 12) {
    throw new Error(`Invalid month number: ${month1to12}`);
  }
  if (year < 1 || year > 9999) {
    throw new Error(`Invalid year: ${year}`);
  }
  const maxDateInMonth1to12 = [
    0,
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return maxDateInMonth1to12[month1to12]!;
};

function _toDMY(date: ISO8601DateString) {
  let [_, yyyy, mm, dd] = date.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/) ?? [];
  if (!yyyy) throw new Error(`Invalid date: ${date}`);
  let year = Number(yyyy);
  let month = Number(mm);
  let day = Number(dd);
  return {
    year,
    month,
    day,
  };
}

/**
 * Increments an ISO8601 date string by the specified amount
 */
export function addDate(
  date: ISO8601DateString,
  increment: { days?: number; months?: number; years?: number }
): ISO8601DateString {
  let { year, month, day } = _toDMY(date);
  const isLastDayInMonth = day === getMaxDayInMonth(month, year);
  const checkMonthRollover = () => {
    if (month < 1) {
      month += 12;
      year -= 1;
    } else if (month > 12) {
      month -= 12;
      year += 1;
    }
  };

  if (typeof increment.years === 'number') {
    if (!Number.isSafeInteger(increment.years)) {
      throw new Error('addDate: years increment must be an integer value');
    }
    year += increment.years;
  }

  if (typeof increment.months === 'number') {
    if (!Number.isSafeInteger(increment.months)) {
      throw new Error('addDate: months increment must be an integer value');
    }
    const yearsFromMonths = Math.trunc(increment.months / 12);
    year += yearsFromMonths;
    month += increment.months - yearsFromMonths * 12;
    checkMonthRollover();
    day = isLastDayInMonth
      ? // if the initial date was the last day of the month, also set the result
        // to the last day of the incremented month
        getMaxDayInMonth(month, year)
      : // otherwise, make sure the day is within the month
        Math.min(day, getMaxDayInMonth(month, year));
  }

  if (typeof increment.days === 'number') {
    if (!Number.isSafeInteger(increment.days)) {
      throw new Error('addDate: days increment must be an integer value');
    }
    day += increment.days;
    while (day < 1) {
      month -= 1;
      checkMonthRollover();
      day += getMaxDayInMonth(month, year);
    }
    for (;;) {
      const maxDay = getMaxDayInMonth(month, year);
      if (day <= maxDay) break;
      day -= maxDay;
      month += 1;
      checkMonthRollover();
    }
  }

  return buildIsoDateString(day, month, year);
}

/**
 * Convert a local `Date` value into a ISO8601 date string
 */
export function fromLocalDate(d: Date): string {
  return buildIsoDateString(d.getDay(), d.getMonth() + 1, d.getFullYear());
}

/**
 * Convert a UTC `Date` value into a ISO8601 date string
 */
export function fromUTCDate(d: Date): string {
  return buildIsoDateString(
    d.getUTCDay(),
    d.getUTCMonth() + 1,
    d.getUTCFullYear()
  );
}

function toDate(
  type: 'local' | 'utc',
  date: ISO8601DateString,
  time?: { h?: number; m?: number; s?: number; ms?: number }
) {
  const { year, month, day } = _toDMY(date);
  const { h, m, s, ms } = time ?? {};
  let seconds = s;
  let millis = ms;
  // if we have seconds but no milliseconds, allow seconds to be fractional
  if (typeof s === 'number' && typeof ms === 'undefined') {
    seconds = Math.trunc(s);
    millis = Math.trunc((s - seconds) * 1000);
  }
  return type === 'local'
    ? new Date(year, month - 1, day, h, m, seconds, millis)
    : new Date(Date.UTC(year, month - 1, day, h, m, seconds, millis));
}

/**
 * Convert a ISO8601 date string into a local `Date` value
 */
export function toLocalDate(
  date: ISO8601DateString,
  time?: { h?: number; m?: number; s?: number; ms?: number }
): Date {
  return toDate('local', date, time);
}

/**
 * Convert a ISO8601 date string into a UTC `Date` value
 */
export function toUTCDate(
  date: ISO8601DateString,
  time?: { h?: number; m?: number; s?: number; ms?: number }
): Date {
  return toDate('utc', date, time);
}

/**
 * Convert day, month and year values into a ISO8601 date string
 */
export function fromDMY(value: { day: number; month: number; year: number }) {
  return buildIsoDateString(value.day, value.month, value.year);
}

/**
 * Extract the day, month and year values from an ISO8601 date string
 */
export function toDMY(date: ISO8601DateString) {
  return _toDMY(date);
}

/**
 * Returns today's date in ISO8601 format
 */
export function todaysDate(): ISO8601DateString {
  return fromLocalDate(new Date());
}

/**
 * Returns tomorrow's date in ISO8601 format
 */
export function tomorrowsDate(): ISO8601DateString {
  return addDate(todaysDate(), { days: 1 });
}

/**
 * Returns yesterday's date in ISO8601 format
 */
export function yesterdaysDate(): ISO8601DateString {
  return addDate(todaysDate(), { days: -1 });
}
