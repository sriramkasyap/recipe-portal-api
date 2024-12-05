import mongoose, { InferSchemaType, model, models, Schema } from "mongoose";
import RecipeModel from "./Recipe.model.js";
import UserModel from "./User.model.js";

const MealPlanSchema = new Schema({
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: RecipeModel }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
});

export type MealPlanType = InferSchemaType<typeof MealPlanSchema>;

const MealPlanModel =
  models.MealPlan || model<MealPlanType>("MealPlan", MealPlanSchema);

export default MealPlanModel;