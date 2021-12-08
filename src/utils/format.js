function getCurrentLocale() {
  return navigator?.language ?? 'en-US';
}

export function formatNumber(num, digits = 2, addSign = false, notANumber = null) {
  if (!Number.isFinite(num)) {
    return notANumber;
  }

  return (
    (addSign && num > 0 ? '+' : '') +
    num.toLocaleString(getCurrentLocale(), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })
  );
}

export const round = (val, places = 2) => {
  if (!Number.isFinite(val)) return null;

  const mult = Math.pow(10, places);
  return Math.round((val + Number.EPSILON) * mult) / mult;
}

export const substituteVars = (url, vars) => Object.keys(vars).reduce((cum, key) => cum.replace(new RegExp('\\${' + key + '}', 'gi'), vars[key]), url);
