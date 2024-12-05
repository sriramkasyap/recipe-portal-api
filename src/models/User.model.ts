import mongoose, {
  Document,
  InferSchemaType,
  Model,
  model,
  Schema,
} from "mongoose";

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    index: true,
  },
});

export type UserType = InferSchemaType<typeof userSchema>;

const UserModel =
  (mongoose.models.User as Model<UserType & Document>) ||
  model<UserType & Document>("User", userSchema);

export default UserModel;
