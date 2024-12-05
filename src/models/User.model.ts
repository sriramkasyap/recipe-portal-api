import { InferSchemaType, model, models, Schema } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: String,
});

export type UserType = InferSchemaType<typeof userSchema>;

const UserModel = models.User || model<UserType>("User", userSchema);

export default UserModel;
