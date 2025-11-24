export function slugify(text: string) {
  return text
    .toLowerCase() // convert to lowercase
    .trim() // remove leading/trailing spaces
    .replace(/\s+/g, "-"); // replace all spaces with hyphens
}
