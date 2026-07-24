import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  status: "pending" | "published";
  userName: string;
  productName: string;
  productId: string;
  stars: number;
  comment: string;
  photos: string[];
  date: string;
}

const reviewSchema = new Schema<IReview>(
  {
    status: { type: String, enum: ["pending", "published"], default: "pending" },
    userName: { type: String, required: true },
    productName: { type: String, required: true },
    productId: { type: String, default: "", index: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    date: { type: String, required: true },
  },
  { timestamps: true },
);

const Review: Model<IReview> =
  mongoose.models.review || mongoose.model<IReview>("review", reviewSchema);

export default Review;
