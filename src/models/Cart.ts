import mongoose, { Document, Schema } from "mongoose";

export interface CartItem extends Document {
  product: mongoose.Types.ObjectId;
  quantity: Number;
}

const CartItemSchema = new Schema<CartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
});

export interface Cart extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  total: number;
}

const CartSchema = new Schema<Cart>(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    items: [CartItemSchema],
    total: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<Cart>("Cart", CartSchema);
