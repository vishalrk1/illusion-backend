import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  address_line1: string;
  address_line2: string;
  address_type: "Home" | "Work" | "Other";
  city: string;
  state: string;
  country: string;
  postal_code: string;
  isDefault: Boolean;
}

export const addressSchema = new Schema<IAddress>({
  address_line1: { type: String, required: true },
  address_line2: { type: String },
  address_type: {
    type: String,
    enum: ["Home", "Work", "Other"],
    required: true,
    default: "Home",
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postal_code: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

export default mongoose.model<IAddress>("Address", addressSchema);
