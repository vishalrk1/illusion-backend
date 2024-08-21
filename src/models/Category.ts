import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  title: string;
  description: string;
  image: string;
  products: mongoose.Types.ObjectId[];
}

const categorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICategory>("Category", categorySchema);
