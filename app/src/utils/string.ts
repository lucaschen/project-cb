export const trimAndNullOnEmpty = (str: string) => {
  const trimmed = str.trim();

  return trimmed || null;
};
