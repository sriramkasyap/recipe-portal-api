import mongoose, { Document, InferSchemaType, model } from "mongoose";
import UserModel from "./User.model.js";

const recipeSchema = new mongoose.Schema(
  {
    title: String,
    ingredients: {
      type: Map,
      of: {
        name: String,
        quantity: { type: Number, required: false },
        units: { type: String, required: false },
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel,
    },
  },
  {
    timestamps: true,
  }
);

export type RecipeType = InferSchemaType<typeof recipeSchema> & Document;

const RecipeModel =
  mongoose.models.Recipe || model<RecipeType>("Recipe", recipeSchema);

export default RecipeModel;
