import Product from "../models/Product";
import Cart, { CartItem } from "../models/Cart";
import Order, { OrderItem } from "../models/Order";
import { Request, Response } from "express";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      message: "Sucessfull fetched orders",
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      message: "Cant get orders, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { shippingAddress, paymentMethod } = req.body;
  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length == 0) {
      res.status(404).json({
        message: "Cart is empty",
      });
    }

    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })) as OrderItem[];

    const totalAmount = orderItems.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0
    );

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
      orderStatus: "processing",
    });
    await order.save();
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    res.status(200).json({ message: "order placed sucessfully", data: order });
  } catch (error) {
    res.status(400).json({
      message: "Cant get orders, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const getIndividualOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.product"
    );
    res
      .status(200)
      .json({ message: "order details fetched sucesfully", data: order });
  } catch (error) {
    res.status(400).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const orderId = req.params;

  try {
    const order = await Order.findOne({ user: userId, _id: orderId });

    if (!order) {
      res.status(404).json({ message: "Order Not Found" });
      return;
    }

    if (order.orderStatus !== "pending" && order.orderStatus !== "processing") {
      res.status(400).json({ message: "Can not cancel the order" });
      return;
    }

    res.status(200).json({ message: "Order canceled sucessfully" });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong, cant get order",
      error: (error as Error).message,
    });
  }
};

// Admin Apis
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "email");
    res
      .status(200)
      .json({ message: "Successfully fetched orders", data: orders });
  } catch (error) {
    res.status(500).json({
      message: "Cant get orders, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { orderStatus, paymentMethod, trackingNumber } = req.body;

  console.log(req.body);
  try {
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      res.status(404).json({ message: "Order Not Found" });
    }
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.save();
    res.status(200).json({ message: "Sucessfully updated order", data: order });
  } catch (error) {
    res.status(500).json({
      message: "Cant update orders, something went wrong",
      error: (error as Error).message,
    });
  }
};
