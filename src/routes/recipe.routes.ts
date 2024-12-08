import { Request, Response, Router } from "express";
import RecipeController from "../controllers/Recipe.controller.js";
import RecipeModel, { RecipeType } from "../models/Recipe.model.js";
import { capitalize, slugify } from "../utils/common.js";

const recipeRouter = Router();

recipeRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { title, limit } = req.query;

    const recipes = await RecipeController.listRecipes({
      ...(title && { title: title as string }),
      ...(limit && { limit: parseInt(limit as string) }),
    });
    res.json({ success: true, recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error });
  }
});

recipeRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await RecipeController.getRecipeById(id);
    res.json({ success: true, recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error });
  }
});

recipeRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const ingredients = await RecipeController.generateIngredientsList(title);

    console.log({ ingredients });

    const recipe = await RecipeModel.create({
      title: capitalize(title),
      ingredients: ingredients.reduce((acc: any, ingredient: any) => {
        acc[slugify(ingredient.name)] = {
          name: capitalize(ingredient.name),
          quantity: ingredient.quantity,
          units: ingredient.units,
        };
        return acc;
      }, {} as RecipeType["ingredients"]),
    });

    res.json({ success: true, recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error });
  }
});

export default recipeRouter;
