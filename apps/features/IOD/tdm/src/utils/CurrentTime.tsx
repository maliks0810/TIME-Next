export const getCurrentLocalTime = () => {
  const options : Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
      hour12: true,
    };
  return new Intl.DateTimeFormat('en-US', options).format(new Date());
}