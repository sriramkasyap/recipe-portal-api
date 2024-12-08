export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z-]/g, "");
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const NAME_ADJUSTMENTS: Record<string, string> = {
  "cooking oil": "Oil",
  "cooking butter": "Butter",
};

export function cleanupIngredientName(name: string) {
  let returner = name;
  // If Ingredient name is in plural, convert it to singular
  if (name.endsWith("s")) {
    returner = name.slice(0, -1);
  }

  if (name.endsWith("es")) {
    returner = name.slice(0, -2);
  }

  // Remove anything in brackets
  returner = returner.replace(/\s*\(.*\)/g, "");

  // Adjustments
  returner = NAME_ADJUSTMENTS[returner.toLowerCase()] || returner;

  return capitalize(returner);
}
