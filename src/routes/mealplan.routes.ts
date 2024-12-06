import { Request, Response, Router } from "express";
import MealController from "../controllers/MealPlan.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const mealRouter = Router();

mealRouter.use(verifyToken);

// Get User's active meal plan
mealRouter.get("/", async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const mealController = new MealController();
  await mealController.init(userId);
  const mealPlan = await mealController.getMealPlan();

  res.status(200).json({ success: true, mealPlan });
});

// Add recipe to meal plan
mealRouter.post("/recipe", async (req: Request, res: Response) => {
  const userId = req.userId;
  const recipeId = req.body.recipeId;

  if (!userId || !recipeId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const mealController = new MealController();
  await mealController.init(userId);
  const mealPlan = await mealController.addRecipeToMealPlan(recipeId);

  res.status(200).json({ success: true, mealPlan });
});

// Remove recipe from meal plan
mealRouter.delete("/recipe", async (req: Request, res: Response) => {
  const userId = req.userId;
  const recipeId = req.body.recipeId;

  if (!userId || !recipeId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const mealController = new MealController();
  await mealController.init(userId);
  const mealPlan = await mealController.removeRecipeFromMealPlan(recipeId);

  res.status(200).json({ success: true, mealPlan });
});

// Toggle Meal Plan
mealRouter.put("/toggle", async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const mealController = new MealController();
  await mealController.init(userId);
  await mealController.toggleMealPlan();

  const newMealController = new MealController();
  const mealPlan = await newMealController.init(userId);

  res.status(200).json({ success: true, mealPlan });
});

// Clear Meal Plan
mealRouter.delete("/clear", async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const mealController = new MealController();
  await mealController.init(userId);
  const mealPlan = await mealController.clearMealPlan();

  res.status(200).json({ success: true, mealPlan });
});

// Mark Ingredient as Checked/Unchecked
mealRouter.put("/grocery", async (req: Request, res: Response) => {
  const userId = req.userId;
  const ingredientSlug = req.body.ingredientSlug;
  const checked = req.body.checked;

  if (!userId || !ingredientSlug || checked === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const mealController = new MealController();
  await mealController.init(userId);
  await mealController.toggleGroceryItem(ingredientSlug, checked);
  const mealPlan = await mealController.getMealPlan();

  res.status(200).json({ success: true, mealPlan });
});

export default mealRouter;
