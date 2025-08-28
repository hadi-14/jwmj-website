export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    year: date.getFullYear()
  };
};