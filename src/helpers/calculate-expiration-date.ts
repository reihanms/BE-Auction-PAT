export const calculateExpirationDate = (
  currentDate: Date,
  day: number,
  hour: number,
): Date => {
  const expirationDate = new Date(currentDate);
  expirationDate.setDate(currentDate.getDate() + day);
  expirationDate.setHours(hour, 0, 0, 0);

  return expirationDate;
};
