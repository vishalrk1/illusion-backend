import mongoose, { Document } from "mongoose";

interface Feedback extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  isFeatured: boolean;
}

const FeedbackSchema = new mongoose.Schema<Feedback>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<Feedback>("Feedback", FeedbackSchema);
