export const calculateExpirationDate = (
  currentDate: Date,
  day: number,
  hour: number,
): Date => {
  const expirationDate = new Date(currentDate);
  expirationDate.setDate(currentDate.getDate() + day);
  expirationDate.setHours(currentDate.getHours() + hour);

  return expirationDate;
};
