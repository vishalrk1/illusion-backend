import Address from "../models/Address";
import User from "../models/User";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const addAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const address = req.body;

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

    // Create a new Address document
    const newAddress = new Address(address);
    await newAddress.validate();

    existingUser.addresses.push(newAddress);
    await existingUser.save();

    res.json({
      message: "Profile completed successfully",
      addresses: existingUser.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error completing profile",
      error: (error as Error).message,
    });
  }
};

export const updateAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { addressId } = req.params;
  const updatedAddress = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      session.abortTransaction();
      res.status(404).json({ message: "User not found" });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (item) => item._id.toString() === addressId
    );
    if (addressIndex === -1) {
      session.abortTransaction();
      res.status(404).json({ message: "Address Not Found!!" });
      return;
    }

    Object.assign(user.addresses[addressIndex], updatedAddress);
    await user.save({ session });

    await session.commitTransaction();
    res.status(200).json({
      message: "Address updated sucessfully",
      address: user.addresses,
    });
  } catch (error) {
    session.abortTransaction();
    res.status(500).json({
      message: "Error updatinag address",
      error: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { addressId } = req.params;

  console.log(addressId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: "User not found" });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: "Address not found" });
      return;
    }

    const removedAddress = user.addresses.splice(addressIndex, 1)[0];
    if (removedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save({ session });
    await Address.findByIdAndDelete(addressId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Address deleted sucessfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in deleting Address" });
  }
};
