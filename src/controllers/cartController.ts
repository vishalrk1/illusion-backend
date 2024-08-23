import { Request, Response } from "express";
import Cart, { CartItem } from "../models/Cart";
import User from "../models/User";
import { calculateCartTotal } from "utils/cartHelpers";
import Product from "@models/Product";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const user = await User.findById(userId);
    console.log(user);
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      res.status(404).json({
        message: "Cart not found",
      });
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
  try {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      cart = new Cart({ user: userId, items: [], total: 0 });
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
    await cart.save();
    res.status(200).json({ message: "Item added sucessfully", data: cart });
  } catch (error) {
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
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // checking if product has sufficient stock
      const product = await Product.findById(productId);
      if (!product || product.stockQuantity < quantity) {
        res.status(400).json({ message: "Stock is not available!" });
        return;
      }
      cart.items[itemIndex].quantity = quantity;
    }

    cart.total = await calculateCartTotal(cart);
    await cart.save();
    res.status(200).json({ message: "Updated cart sucessfully", data: cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart" });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    cart.total = await calculateCartTotal(cart);
    await cart.save();
    res.status(200).json({ message: "Items removed sucessfully", data: cart });
  } catch (error) {
    res.status(500).json({
      message: "Error removing item from cart",
      error: (error as Error).message,
    });
  }
};
