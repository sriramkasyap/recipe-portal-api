import { parse } from "csv-parse/sync";
import fs from "fs";
import mongoose from "mongoose";
import RecipeModel, { RecipeType } from "./models/Recipe.model.js";
import { slugify } from "./utils/common.js";

const parseGroceries = async (filePath: string) => {
  const file = fs.readFileSync(filePath, "utf8");
  const records = parse(file, { columns: true });
  return records;
};

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/viva-recipes")
  .then(async () => {
    console.log("Connected to MongoDB");
    const groceries = await parseGroceries(
      "full_stack_project_grocery_list.csv"
    );

    let recipeMap = new Map<string, Partial<RecipeType>>();

    for (const grocery of groceries) {
      let recipeSlug = slugify(grocery["Dish name"]);
      let ingredientSlug = slugify(grocery["Ingredients"]);

      if (!recipeMap.has(recipeSlug)) {
        recipeMap.set(recipeSlug, {
          title: grocery["Dish name"],
          ingredients: new Map(),
        });
      }

      let ingredientMap: RecipeType["ingredients"] =
        recipeMap.get(recipeSlug)?.ingredients || new Map();

      ingredientMap.set(ingredientSlug, {
        name: grocery["Ingredients"],
        ...(grocery["Quantity"] && !isNaN(parseInt(grocery["Quantity"]))
          ? { quantity: parseInt(grocery["Quantity"]) }
          : {}),
        ...(grocery["Unit of Measure"]
          ? { units: grocery["Unit of Measure"] }
          : {}),
      });

      recipeMap.set(recipeSlug, {
        ...recipeMap.get(recipeSlug),
        ingredients: ingredientMap,
      });
    }

    let recipes = Array.from(recipeMap.values());
    console.log(`Inserted ${recipes.length} recipes`);
    await RecipeModel.create(recipes);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  })
  .finally(() => {
    process.exit(0);
  });
