import dotenv from "dotenv";
import IngredientModel from "../models/Ingredient.model.js";
import RecipeModel, { RecipeType } from "../models/Recipe.model.js";
import { capitalize, slugify } from "../utils/common.js";
import GPTController from "./GPT.controller.js";

dotenv.config();

export default class RecipeController {
  // List Recipes
  static listRecipes = async (filter: {
    title?: string;
    limit?: number;
  }): Promise<RecipeType[]> => {
    return RecipeModel.find({
      title: { $regex: filter.title, $options: "i" },
    }).limit(filter.limit || 5);
  };

  // Get Recipe by ID
  static getRecipeById = async (id: string): Promise<RecipeType | null> => {
    return RecipeModel.findById(id);
  };

  // Create New Recipe
  static createRecipe = async (recipe: RecipeType): Promise<RecipeType> => {
    return RecipeModel.create(recipe);
  };

  //   Generate Recipe from title
  static generateIngredientsList = async (title: string) => {
    const existingIngredients = (
      await IngredientModel.find({}, { groceryListName: 1 })
    ).map((a) => a.groceryListName);

    console.log({ existingIngredients });

    const system_prompt =
      "You generate ingredient lists for recipes. Use only lb, tbsp, or cup for units. Do not add units for pieces like eggs, potatoes, etc. No need to mention quantity for spices or herbs.";
    const user_prompt = `Generate an ingredient list for a recipe with the title: ${title}. Limit ingredient names to 25 characters. Try to reuse the ingredient names from the following list: ${existingIngredients.join(
      ", "
    )}. If there are no ingredients in the list that match, make up a new name and return the "newIngredient" property as true.`;

    const response = await GPTController.generateDataFromPrompt(
      system_prompt,
      user_prompt,
      {
        name: "ingredients",
        schema: {
          type: "object",
          properties: {
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  units: { type: "string" },
                  newIngredient: { type: "boolean", default: false },
                },
                required: ["name"],
              },
            },
          },
        },
      }
    );

    const { ingredients } = response;

    const newIngredients = ingredients.filter((a: any) => a.newIngredient);

    console.log({ newIngredients });

    await IngredientModel.create(
      newIngredients.map((a: any) => ({
        groceryListName: capitalize(a.name),
        slug: slugify(a.name),
      }))
    );

    return ingredients;
  };
}
