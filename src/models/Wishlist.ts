import mongoose, { Document, Schema } from "mongoose";

export interface Wishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const wishlistSchema = new Schema<Wishlist>({
  user: { type: Schema.Types.ObjectId, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

export default mongoose.model<Wishlist>("Wishlist", wishlistSchema);
