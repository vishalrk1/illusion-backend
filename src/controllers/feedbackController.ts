import Feedback from "@models/Feedback";
import { Request, Response } from "express";

export const getFeedBacks = async (req: Request, res: Response) => {
  const { isFeatured } = req.query;
  try {
    let query: any = {};
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    const feedbacks = await Feedback.find(query);
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
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(200).json({
      message: "Feedback added successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(400).json({
      message: "Cant add Product, Something went wrong",
      error: (error as Error).message,
    });
  }
};
