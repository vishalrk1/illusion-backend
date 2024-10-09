import Feedback from "../models/Feedback";
import { Request, Response } from "express";

export const getFeedBacks = async (req: Request, res: Response) => {
  const { isFeatured } = req.query;
  console.log(req.query);
  try {
    let query: any = {};
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    const feedbacks = await Feedback.find(query).populate("user");
    res.status(200).json({
      message: "Feedbacks fetched successfully",
      data: feedbacks,
    });
  } catch (error) {
    res.status(400).json({
      message: "Cant get Products, Something went wrong",
      error: (error as Error).message,
    });
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { message } = req.body;
  try {
    const existingFeedback = await Feedback.findOne({ user: userId });
    if (existingFeedback) {
      res.status(400).json({
        message: "Feedback already submitted",
      });
      return;
    }

    const feedback = new Feedback({ user: userId, message: message });
    await feedback.save();
    const allFeedbacks = await Feedback.find();
    res.status(200).json({
      message: "Feedback added successfully",
      data: allFeedbacks,
    });
  } catch (error) {
    res.status(400).json({
      message: "Feedback not submitted, Something went wrong",
      error: (error as Error).message,
    });
  }
};
