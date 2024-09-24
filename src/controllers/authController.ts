import { Request, Response } from "express";
import * as authService from "../services/authService";
import User from "../models/User";
import Address from "../models/Address";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, phone, email, password } = req.body;
    console.log(req.body);

    if (!first_name || !phone || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email & password" });
    }

    const existingUser = await User.findOne({ phone });
    console.log("Existing USer: ", existingUser);
    if (existingUser) {
      res
        .status(400)
        .json({ message: "User Already Exists with this phone number!" });
    }

    const user = await authService.registerUser(req.body);
    res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
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
  const { phone, address, user } = req.body;
  const userId = user._id;
  console.log(req?.user);

  if (!phone || !address) {
    res.status(400).json({
      message: "Please provide phone number and address",
    });
    return;
  }

  // Check for all required address fields
  const requiredAddressFields = [
    "address_line1",
    "address_type",
    "city",
    "state",
    "country",
    "postal_code",
  ];
  for (const field of requiredAddressFields) {
    if (!address[field]) {
      res.status(400).json({
        message: `Please provide ${field} in the address`,
      });
      return;
    }
  }

  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    existingUser.phone = phone;

    // Create a new Address document
    const newAddress = new Address(address);
    await newAddress.validate();

    existingUser.addresses.push(newAddress);
    existingUser.isProfileComplete = true;

    await existingUser.save();
    res.json({
      message: "Profile completed successfully",
      user: {
        id: existingUser._id,
        name: existingUser.first_name,
        email: existingUser.email,
        phoneNumber: existingUser.phone,
        addresses: existingUser.addresses,
        image: existingUser.image,
        isProfileComplete: existingUser.isProfileComplete,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error completing profile",
      error: (error as Error).message,
    });
  }
};
