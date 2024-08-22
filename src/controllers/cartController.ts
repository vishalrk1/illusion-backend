import Cart, { CartItem } from "@models/Cart";
import { Request, Response } from "express";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!._id;
  try {
    const cart = await Cart.find({ user: userId }).populate("items.product");

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
  const userId = req.user!._id;
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingCartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity: quantity } as CartItem);
    }

    await cart.save();
    res.status(200).json({ message: "Item added sucessfully", data: cart });
  } catch (error) {
    res.status(400).json({
      message: "Cant get cart, something went wrong",
      error: (error as Error).message,
    });
  }
};
