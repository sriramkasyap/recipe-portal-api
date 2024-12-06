import mongoose, { HydratedDocument } from "mongoose";
import MealPlanModel, { MealPlanType } from "../models/MealPlan.model.js";
import RecipeModel from "../models/Recipe.model.js";
import { GroceryList } from "../types/Meal.types.js";
import { slugify } from "../utils/common.js";

export default class MealController {
  private mealPlan: HydratedDocument<MealPlanType> | undefined;

  private groceryList: GroceryList | undefined;

  async init(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{ mealPlan: MealPlanType; groceryList: GroceryList }> {
    let mealPlan = await MealPlanModel.findOne({
      user: userId,
      active: true,
    });

    this.mealPlan = mealPlan;
    await this.generateGroceryList();

    return { mealPlan, groceryList: this.groceryList as GroceryList };
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

    return {
      mealPlan: this.mealPlan,
      groceryList: this.groceryList as GroceryList,
    };
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

    return {
      mealPlan: this.mealPlan,
      groceryList: this.groceryList as GroceryList,
    };
  };

  // Get meal plan
  getMealPlan = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }

    const mealPlan = await this.mealPlan.populate("recipes");

    return mealPlan;
  };

  // Get Grocery List
  getGroceryList = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }
    if (!this.groceryList) {
      throw new Error("Grocery list not found");
    }
    return this.groceryList;
  };

  // Generate Grocery List
  private generateGroceryList = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }
    this.groceryList = {};

    const recipes = await RecipeModel.find({
      _id: { $in: this.mealPlan.recipes },
    });

    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients.values()) {
        let ingredientSlug = slugify(ingredient.name);
        if (this.groceryList[ingredientSlug]) {
          this.groceryList[ingredientSlug].quantity += ingredient.quantity;
        } else {
          this.groceryList[ingredientSlug] = {
            name: ingredient.name,
            quantity: ingredient.quantity,
            units: ingredient.units,
          };
        }
      }
    }
  };

  // Clear Meal Plan
  clearMealPlan = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }
    this.mealPlan.recipes = [];
    await this.mealPlan.save();
    this.groceryList = {};

    return {
      mealPlan: this.mealPlan,
      groceryList: this.groceryList as GroceryList,
    };
  };

  // Toggle Meal Plan
  toggleMealPlan = async () => {
    if (!this.mealPlan) {
      throw new Error("Meal plan not found");
    }
    this.mealPlan.active = !this.mealPlan.active;
    await this.mealPlan.save();

    await this.generateGroceryList();

    return {
      mealPlan: this.mealPlan,
      groceryList: this.groceryList as GroceryList,
    };
  };
}
