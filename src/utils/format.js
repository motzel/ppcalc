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
