/**
 * Capitalization utility function
 * Capitalizes the first letter of each word in a string
 */
export const toTitleCase = (str) => {
  if (!str) return "";
  // Capitalize first letter of each word
  return str.replace(/(^|\s)([a-z])/g, (_, space, char) => space + char.toUpperCase());
};

/**
 * Sentence case capitalization
 * Capitalizes only the first letter and letters after periods (with or without space)
 */
export const toSentenceCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/^(\w)/, (char) => char.toUpperCase())
    .replace(/([.!?]\s*)(\w)/g, (_, punct, char) => punct + char.toUpperCase());
};
