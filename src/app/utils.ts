// utils.ts

/**
 * Converts a string into a URL-friendly slug.
 * @param text The input string to slugify.
 * @returns A slugified version of the input string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}
