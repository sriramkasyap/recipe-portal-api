import mongoose, { HydratedDocument } from "mongoose";
import IngredientModel from "../models/Ingredient.model.js";
import MealPlanModel, { MealPlanType } from "../models/MealPlan.model.js";
import RecipeModel from "../models/Recipe.model.js";
import { GroceryList } from "../types/Meal.types.js";

export default class MealController {
  private mealPlan: HydratedDocument<MealPlanType> | undefined;

  async init(userId: string | mongoose.Types.ObjectId): Promise<MealPlanType> {
    let mealPlan = await MealPlanModel.findOne({
      user: userId,
      active: true,
    });

    if (!mealPlan) {
      mealPlan = await MealPlanModel.create({
        user: userId,
        active: true,
      });
    }

    this.mealPlan = mealPlan;

    return mealPlan;
  }

  // Add recipe to meal plan
  addRecipeToMealPlan = async (recipe: mongoose.Types.ObjectId) => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }

    if (!this.mealPlan.recipes.includes(recipe)) {
      this.mealPlan.recipes.push(recipe);
      await this.mealPlan.save();
      await this.generateGroceryList();
    }

    return this.mealPlan;
  };

  // Remove recipe from meal plan
  removeRecipeFromMealPlan = async (recipe: mongoose.Types.ObjectId) => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }

    this.mealPlan.recipes = this.mealPlan.recipes.filter(
      (r) => r.toString() !== recipe.toString()
    );

    await this.mealPlan.save();

    await this.generateGroceryList();

    return this.mealPlan;
  };

  // Get meal plan
  getMealPlan = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }

    const mealPlan = await this.mealPlan.populate("recipes");

    return mealPlan;
  };

  // Generate Grocery List
  private generateGroceryList = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }

    const recipes = await RecipeModel.find({
      _id: { $in: this.mealPlan.recipes },
    });

    let masterIngredients = await IngredientModel.find({});
    const groceryMap = masterIngredients.reduce((agg, ing) => {
      agg[ing.slug] = ing.groceryListName;

      return agg;
    }, {} as Record<string, string>);

    let groceryList: GroceryList = {};

    for (const recipe of recipes) {
      let ingredients = recipe.ingredients?.keys();

      if (!ingredients) {
        continue;
      }

      for (let ingredientSlug of ingredients) {
        const ingredient = recipe.ingredients?.get(ingredientSlug);

        if (groceryList[ingredientSlug]) {
          if (groceryList[ingredientSlug].quantity || ingredient?.quantity) {
            groceryList[ingredientSlug].quantity =
              (groceryList[ingredientSlug].quantity || 0) +
              (ingredient?.quantity || 0);
          }
        } else {
          groceryList[ingredientSlug] = {
            name: groceryMap[ingredientSlug],
            quantity: ingredient?.quantity,
            units: ingredient?.units,
            checked: false,
          };
        }
      }
    }

    this.mealPlan.groceryList = groceryList;
    await this.mealPlan.save();
  };

  // Clear Meal Plan
  clearMealPlan = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }
    this.mealPlan.recipes = [];
    this.mealPlan.groceryList = new Map();
    await this.mealPlan.save();

    return this.mealPlan;
  };

  // Toggle Meal Plan
  toggleMealPlan = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }
    this.mealPlan.active = !this.mealPlan.active;
    await this.mealPlan.save();

    await this.generateGroceryList();

    return this.mealPlan;
  };

  toggleGroceryItem = async (ingredientSlug: string, checked: boolean) => {
    if (!this.mealPlan || !this.mealPlan.groceryList) {
      throw new Error("Meal plan not found");
    }

    let result = await MealPlanModel.updateOne(
      { _id: this.mealPlan._id },
      { $set: { [`groceryList.${ingredientSlug}.checked`]: checked } }
    );

    return this.mealPlan;
  };
}
