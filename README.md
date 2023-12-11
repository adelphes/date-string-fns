## date-string-fns

A library for manipulating ISO8601 date strings.

An ISO8601 date is a string in the format `yyyy-mm-dd` - 10 characters, consisting of a 4-digit year, 2-digit month and 2-digit day, separated by dashes.
Examples of ISO8601 dates:

- `'2013-06-30'` - 30th June 2013
- `'1900-01-01'` - 1st January 1900
- `'1776-07-04'` - July 4th 1776
- `'1066-10-14'` - 14th October 1066
- `'0815-06-28'` - June 28th 815

### Installation

```sh
npm install date-string-fns
```

```sh
yarn add date-string-fns
```

### Usage

Conversion to ISO8601

From a Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object using the local time value:

```ts
import { fromLocalDate } from 'date-string-fns';

const iso = fromLocalDate(new Date()); // '2013-05-31'
```

From a Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object using UTC time value:

```ts
import { fromUTCDate } from 'date-string-fns';

const iso = fromUTCDate(new Date()); // '2013-05-31'
```

From raw day, month and year values:

```ts
import { fromDMY } from 'date-string-fns';

const iso = fromDMY({ day: 4, month: 7, year: 1776 }); // '1776-07-04'
```

Convenience functions

```ts
import { todaysDate, tomorrowsDate, yesterdaysDate } from 'date-string-fns';

const today = todaysDate(); // '2013-02-14'
const tomorrow = tomorrowsDate(); // '2013-02-15'
const yesterday = yesterdaysDate(); // '2013-02-13'
```

Conversion from ISO8601

To a local Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object

```ts
import { toLocalDate } from 'date-string-fns';

const date = toLocalDate('2013-02-14'); // 14th Feb 2013 at midnight (local time)
```

To a UTC Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object

```ts
import { toUTCDate } from 'date-string-fns';

const date = toUTCDate('2013-02-14', { h: 16, m: 31, s: 45, ms: 678 }); // 14th Feb 2013 at 16:31:45.678 (utc)
```

To day, month and year values

```ts
import { toDMY } from 'date-string-fns';

const { day, month, year } = toDMY('2013-04-26'); // { day: 26, month: 4, year: 2013 }
```
