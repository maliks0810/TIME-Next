export const getCurrentLocalTime = () => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date());
}

export const formatDate = (date: Date | null): string | null => {
  if (!date) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export const formatDateTime = (date: Date | null): string | null => {
  if (!date) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export const getLocalDateTimeOffsetIsoString = (date: Date): string => {
  // Get local timezone offset
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  const sign = offsetMinutes > 0 ? "-" : "+";
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetTimeHour = String(Math.floor(absOffsetMinutes / 60)).padStart(2, "0");
  const offsetTimeMinutes = String(absOffsetMinutes % 60).padStart(2, "0");

  // Format date part from given date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Formate time part from local time
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${sign}${offsetTimeHour}:${offsetTimeMinutes}`;
}

export const today = (): string => new Date().toDateString();

export const getDateFromString = (dateString: string): Date | null => {
  if (typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}
