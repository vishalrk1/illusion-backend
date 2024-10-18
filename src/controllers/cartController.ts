import { Request, Response } from "express";
import { calculateCartTotal } from "../utils/cartHelpers";

import Cart, { CartItem } from "../models/Cart";
import Product from "../models/Product";
import mongoose from "mongoose";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      res.status(404).json({
        message: "Cart not found",
      });
      return;
    }

    res
      .status(200)
      .json({ message: "Cart data fetched sucessfully", data: cart });
  } catch (error) {
    res.status(400).json({
      message: "Cant get cart, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const addProductToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [cart, product] = await Promise.all([
      Cart.findOneAndUpdate(
        {
          user: userId,
        },
        { $setOnInsert: { user: userId, items: [], total: 0 } },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          session,
        }
      ),
      Product.findById(productId)
        .select("price stockQuantity")
        .session(session),
    ]);

    if (!cart) {
      throw new Error("Cart not found");
    }

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stockQuantity < quantity) {
      throw new Error("Stock is not available!");
    }

    const existingCartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity: quantity } as CartItem);
    }

    cart.total = await calculateCartTotal(cart);
    await Promise.all([
      cart.save({ session }),
      Product.findByIdAndUpdate(
        productId,
        {
          $inc: { stockQuantity: -quantity },
        },
        { session }
      ),
    ]);

    session.commitTransaction();
    session.endSession();

    await cart.populate("items.product");
    res.status(200).json({ message: "Item added sucessfully", data: cart });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Cant get cart, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [cart, product] = await Promise.all([
      Cart.findOne({ user: req.user!.id }, { session }),
      Product.findById(productId).select("stockQuantity").session(session),
    ]);

    if (!cart) {
      throw new Error("Cart not found");
    }

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stockQuantity < quantity) {
      throw new Error("Stock is not available!");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    const currentQuantity = cart.items[itemIndex].quantity as number;
    const quantityDiff = quantity - currentQuantity;

    if (product.stockQuantity < quantityDiff) {
      throw new Error("Insufficient stock");
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.total = await calculateCartTotal(cart);

    await Promise.all([
      cart.save({ session }),
      Product.findByIdAndUpdate(
        productId,
        {
          $inc: { stockQuantity: -quantityDiff },
        },
        { session }
      ),
    ]);

    session.commitTransaction();
    session.endSession();

    await cart.populate("items.product");
    res.status(200).json({ message: "Updated cart sucessfully", data: cart });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: (error as Error).message });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: req.user!.id }, { session });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const itemIndx = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndx === -1) {
      throw new Error("Item not found in cart");
    }

    const removeQuantity = cart.items[itemIndx].quantity;
    cart.items.splice(itemIndx, 1);
    cart.total = await calculateCartTotal(cart);

    await Promise.all([
      cart.save({ session }),
      Product.findByIdAndUpdate(
        productId,
        {
          $inc: { stockQuantity: removeQuantity },
        },
        { session }
      ),
    ]);

    session.commitTransaction();
    session.endSession();

    await cart.populate("items.product");
    res.status(200).json({ message: "Items removed sucessfully", data: cart });
  } catch (error) {
    res.status(500).json({
      message: "Error removing item from cart",
      error: (error as Error).message,
    });
  }
};
