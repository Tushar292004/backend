import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  amount: number;
  dob: Date;
  verified: boolean;
  filename: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  dob: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  filename: { type: String, required: true },
});

export default mongoose.model<IUser>("User", UserSchema);
