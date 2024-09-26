import mongoose, { Document, Schema } from "mongoose";
import { IProduct } from "./Product";
import { addressSchema, IAddress } from "./Address";

export interface OrderItem extends Document {
  product: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  price: number;
}

const orderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

export interface Order extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: IAddress;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
}

const orderSchema = new Schema<Order>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ type: orderItemSchema }],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    trackingNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<Order>("Order", orderSchema);
