import { Request, Response, Router } from "express";
import MealController from "../controllers/Meal.controller.js";
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
  let { mealPlan, groceryList } = await mealController.init(userId);

  res.status(200).json({ success: true, mealPlan, groceryList });
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
  const { mealPlan, groceryList } = await mealController.addRecipeToMealPlan(
    recipeId
  );

  res.status(200).json({ success: true, mealPlan, groceryList });
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
  const { mealPlan, groceryList } =
    await mealController.removeRecipeFromMealPlan(recipeId);

  res.status(200).json({ success: true, mealPlan, groceryList });
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
  const { mealPlan, groceryList } = await newMealController.init(userId);

  res.status(200).json({ success: true, mealPlan, groceryList });
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
  const { mealPlan, groceryList } = await mealController.clearMealPlan();

  res.status(200).json({ success: true, mealPlan, groceryList });
});

export default mealRouter;
