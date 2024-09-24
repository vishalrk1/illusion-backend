import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import { addressSchema, IAddress } from "./Address";

export interface IUser extends Document {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "user" | "admin";
  image: string;
  addresses: Types.Array<IAddress>;
  isProfileComplete: Boolean;
  lastLogin: Date;
  comparePassword(userPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    phone: { type: String, unique: true },
    addresses: [addressSchema],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    image: { type: String, default: process.env.DEFAULT_PFP_MALE },
    isProfileComplete: { type: String, default: false },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  userPassword: string
): Promise<boolean> {
  return bcrypt.compare(userPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
