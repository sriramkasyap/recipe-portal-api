import mongoose, { InferSchemaType, model, Schema } from "mongoose";
import RecipeModel from "./Recipe.model.js";
import UserModel from "./User.model.js";

const MealPlanSchema = new Schema(
  {
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: RecipeModel }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
    active: { type: Boolean, default: false },
    groceryList: {
      type: Map,
      of: {
        name: { type: String },
        quantity: { type: Number },
        units: { type: String },
        checked: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export type MealPlanType = InferSchemaType<typeof MealPlanSchema> & Document;

const MealPlanModel =
  mongoose.models.MealPlan || model<MealPlanType>("MealPlan", MealPlanSchema);

export default MealPlanModel;
