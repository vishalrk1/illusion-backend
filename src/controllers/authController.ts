import { Request, Response } from "express";
import * as authService from "../services/authService";
import User from "../models/User";
import Address from "../models/Address";
import Cart from "../models/Cart";
import Wishlist from "../models/Wishlist";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, phone, email, password } = req.body;
    console.log(req.body);

    if (!first_name || !phone || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email & password" });
      return;
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "User Already Exists with this phone number!" });
      return;
    }

    const { user, token } = await authService.registerUser(req.body);
    if (user) {
      user.isProfileComplete = false;
      const cart = new Cart({ user: user._id, items: [], total: 0 });
      const wishlist = new Wishlist({ user: user._id, products: [] });
      await cart.save();
      await wishlist.save();
    }
    res
      .status(201)
      .json({ message: "User registered successfully", token, user });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ message: "Please provide phone & password" });
      return;
    }

    const result = await authService.loginUser(phone, password);
    if (!result) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const { user, token } = result;
    res.json({
      message: "Login successful",
      token,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: (error as Error).message,
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    res.status(200).json({ message: "User fetched sucessfully", user });
  } catch (error) {
    res.status(500).json({
      message: "User logged out",
      error: (error as Error).message,
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { phone, email, address } = req.body;
  const userId = req.user!.id;

  if (!phone || !email) {
    res.status(400).json({
      message: "Please provide phone number and address",
    });
    return;
  }

  try {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    Object.assign(existingUser, { ...req.body });
    existingUser.isProfileComplete = true;

    if (address) {
      const newAddress = new Address(address);
      await newAddress.validate();
      existingUser.addresses.push(newAddress);
    }

    await existingUser.save();
    res.status(200).json({
      message: "Profile completed successfully",
      user: existingUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error completing profile",
      error: (error as Error).message,
    });
  }
};
