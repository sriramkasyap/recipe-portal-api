export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z-]/g, "");
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
