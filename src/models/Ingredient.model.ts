import mongoose, { InferSchemaType, Model, model } from "mongoose";

import { Schema } from "mongoose";

const IngredientSchema = new Schema({
  groceryListName: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
});

type Ingredient = InferSchemaType<typeof IngredientSchema>;

const IngredientModel =
  (mongoose.models.Ingredient as Model<Ingredient>) ||
  model<Ingredient>("Ingredient", IngredientSchema);

export default IngredientModel;
