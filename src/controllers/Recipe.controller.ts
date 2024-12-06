import dotenv from "dotenv";
import RecipeModel, { RecipeType } from "../models/Recipe.model.js";
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
    const system_prompt =
      "You generate ingredient lists for recipes. Use only lb, tbsp, or cup for units. Do not add units for pieces like eggs, potatoes, etc. No need to mention quantity for spices or herbs.";
    const user_prompt = `Generate an ingredient list for a recipe with the title: ${title}. `;

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
                },
                required: ["name"],
              },
            },
          },
        },
      }
    );

    return response;
  };
}
