import mongoose, { InferSchemaType, model, models } from "mongoose";
import UserModel from "./User.model.js";

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: {
    type: Map,
    of: {
      quantity: Number,
      units: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  updatedAt: {
    type: Date,
    default: Date.now(),
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel,
  },
});

export type RecipeType = InferSchemaType<typeof recipeSchema>;

const RecipeModel = models.Recipe || model<RecipeType>("Recipe", recipeSchema);

export default RecipeModel;
