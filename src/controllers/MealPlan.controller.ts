import mongoose, { HydratedDocument } from "mongoose";
import MealPlanModel, { MealPlanType } from "../models/MealPlan.model.js";
import RecipeModel from "../models/Recipe.model.js";
import { GroceryItem } from "../types/Meal.types.js";
import { slugify } from "../utils/common.js";

export default class MealController {
  private mealPlan: HydratedDocument<MealPlanType> | undefined;

  async init(userId: string | mongoose.Types.ObjectId): Promise<MealPlanType> {
    let mealPlan = await MealPlanModel.findOne({
      user: userId,
      active: true,
    });

    this.mealPlan = mealPlan;
    await this.generateGroceryList();

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

    let groceryList = new Map<string, GroceryItem>();

    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients.values()) {
        let ingredientSlug = slugify(ingredient.name);
        if (groceryList.has(ingredientSlug)) {
          if (ingredient.quantity)
            groceryList.get(ingredientSlug)!.quantity += ingredient.quantity;
        } else {
          groceryList.set(ingredientSlug, ingredient);
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
    console.log({ ingredientSlug, checked });

    if (this.mealPlan.groceryList.has(ingredientSlug)) {
      this.mealPlan.groceryList.set(ingredientSlug, {
        ...this.mealPlan.groceryList.get(ingredientSlug),
        checked,
      });

      this.mealPlan.markModified("groceryList");
    }

    // Save the changes to the database
    await this.mealPlan.save();

    return this.mealPlan;
  };
}
