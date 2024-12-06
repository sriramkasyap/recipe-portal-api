import mongoose, {
  InferSchemaType,
  model,
  models,
  mongo,
  Schema,
} from "mongoose";
import RecipeModel from "./Recipe.model.js";
import UserModel from "./User.model.js";

const MealPlanSchema = new Schema(
  {
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: RecipeModel }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type MealPlanType = InferSchemaType<typeof MealPlanSchema> & Document;

const MealPlanModel =
  mongoose.models.MealPlan || model<MealPlanType>("MealPlan", MealPlanSchema);

export default MealPlanModel;
