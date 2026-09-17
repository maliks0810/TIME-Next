// Currently Not deploying this functionality to production. Skip code review

export const formatPercent = (value: unknown, decimals = 2): string => {
  if(value === null || value == undefined || value === "") {
    return '-'
  }

  const numericValue = Number(value);

  if(Number.isNaN(numericValue)) {
    return '-'
  }

  return `${numericValue.toFixed(decimals)}%`;
}

export const formatNumber = (value: unknown, decimals = 2): string => {
  if(value === null || value == undefined || value === "") {
    return '-'
  }

  const numericValue = Number(value);

  if(Number.isNaN(numericValue)) {
    return '-'
  }

  return numericValue.toFixed(decimals);
}