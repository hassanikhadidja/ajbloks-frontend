import mongoose, { Document, Model, Schema } from "mongoose";

export type NewsletterSource =
  | "account"
  | "footer"
  | "signup_drawer"
  | "notre_histoire"
  | "cookies"
  | "diy"
  | "printables"
  | "gifts"
  | "admin";

export interface INewsletterEmail extends Document {
  email: string;
  name: string;
  source: NewsletterSource;
  accepted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterEmailSchema = new Schema<INewsletterEmail>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, default: "", trim: true },
    source: {
      type: String,
      enum: [
        "account",
        "footer",
        "signup_drawer",
        "notre_histoire",
        "cookies",
        "diy",
        "printables",
        "gifts",
        "admin",
      ],
      default: "footer",
    },
    accepted: { type: Boolean, default: true, index: true },
    userId: { type: String, default: "", index: true },
  },
  { timestamps: true },
);

const NewsletterEmail: Model<INewsletterEmail> =
  mongoose.models.newsletteremail ||
  mongoose.model<INewsletterEmail>("newsletteremail", newsletterEmailSchema);

export default NewsletterEmail;
