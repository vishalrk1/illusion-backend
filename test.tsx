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
    phone: { type: String },
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

export interface Wishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const wishlistSchema = new Schema<Wishlist>({
  user: { type: Schema.Types.ObjectId, required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

export default mongoose.model<Wishlist>("Wishlist", wishlistSchema);
