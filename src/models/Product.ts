import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  oldPrice: number;
  images: string[];
  stockQuantity: number;
  specifications: string[];
  isFeatured: boolean;
  category: mongoose.Types.ObjectId;
  isAvailable(quantity: number): Promise<boolean>;
}

const productSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  images: [{ type: String, required: true }],
  stockQuantity: { type: Number, required: true, default: 1 },
  specifications: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

productSchema.methods.isAvailable = async (
  quantity: number
): Promise<boolean> => {
  return quantity >= 1;
};

export default mongoose.model<IProduct>("Product", productSchema);
