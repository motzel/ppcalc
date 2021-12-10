import {getCurrentLocale} from './format'
import {isString} from './js'

export const isValidDate = d => d instanceof Date && !isNaN(d);

export const dateFromString = str => {
    // convert SS page date format to ISO
    const matches = str && isString(str) ? str.match(/^(\d{4}-\d{1,2}-\d{1,2})\s+(\d{1,2}:\d{1,2}(:\d{1,2})?)\sUTC$/) : null;
    if (matches && matches.length >= 3) {
        str = matches[1] + 'T' + matches[2] + 'Z';
    }

    const date = str ? new Date(Date.parse(str)) : null;

    return isValidDate(date) ? date : null;
}

export function formatDateWithOptions(val, options = {localeMatcher: 'best fit'}, locale = getCurrentLocale()) {
    if (!isValidDate(val)) return null;

    const rtf = new Intl.DateTimeFormat(locale, options);

    return rtf.format(val);
}

export function formatDate(val, dateStyle = 'short', timeStyle = 'medium', locale = getCurrentLocale()) {
    return formatDateWithOptions(val, {
        localeMatcher: 'best fit',
        dateStyle,
        timeStyle: timeStyle ?? undefined,
    }, locale);
}

export function formatDateRelative(val, roundFunc = Math.round, unit = 'auto') {
    if (!isValidDate(val)) return null;

    const rtf = new Intl.RelativeTimeFormat('en-US', {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'long'
    });

    const diffInSecs = (Date.now() - dateFromString(val)) / 1000;

    switch(unit) {
        case 'auto':
            if (diffInSecs < 60)
                return rtf.format(-roundFunc(diffInSecs), 'second');
            else if (diffInSecs < 60 * 60)
                return rtf.format(-roundFunc(diffInSecs / 60), 'minute');
            else if (diffInSecs < 60 * 60 * 24)
                return rtf.format(-roundFunc(diffInSecs / (60 * 60)), 'hour');
            else if (diffInSecs < 60 * 60 * 24 * 30)
                return rtf.format(-roundFunc(diffInSecs / (60 * 60 * 24)), 'day');
            else if (diffInSecs < 60 * 60 * 24 * 365)
                return rtf.format(
                  -roundFunc(diffInSecs / (60 * 60 * 24 * 30)),
                  'month'
                );
            else
                return rtf.format(
                  -roundFunc(diffInSecs / (60 * 60 * 24 * 365)),
                  'year'
                );

        default:
            let unitDivider =
              unit === 'second' ? 1 : (
                unit === 'minute' ? 60 : (
                  unit === 'hour' ? 60 * 60 : (
                    unit === 'day' ? 60 * 60 * 24 : (
                      unit === 'month' ? 60 * 60 * 24 * 30 : (
                        unit === 'year' ? 60 * 60 * 24 * 365 : null
                      )
                    )
                  )
                )
              );
            if (!unitDivider) {
                unitDivider = 1;
                unit = 'second';
            }
            return rtf.format(-roundFunc(diffInSecs / unitDivider), unit);
    }
}