import mongoose, { Document, Model, Schema } from "mongoose";

export type PlaySection = "toys" | "diy" | "printables" | "bobs";

export interface IPlayStep {
  image: string;
  text: string;
}

export interface IPlayItem extends Document {
  section: PlaySection;
  videoUrl?: string;
  toyNames?: string[];
  name?: string;
  tags?: string;
  description?: string;
  coverImage?: string;
  steps?: IPlayStep[];
  pdfName?: string;
  pdfUrl?: string;
  slot?: string;
  title?: string;
}

const stepSchema = new Schema<IPlayStep>(
  { image: { type: String, default: "" }, text: { type: String, default: "" } },
  { _id: false },
);

const playItemSchema = new Schema<IPlayItem>(
  {
    section: { type: String, enum: ["toys", "diy", "printables", "bobs"], required: true },
    videoUrl: { type: String, default: "" },
    toyNames: [{ type: String }],
    name: { type: String, default: "" },
    tags: { type: String, default: "" },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    steps: [stepSchema],
    pdfName: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    slot: { type: String, default: "" },
    title: { type: String, default: "" },
  },
  { timestamps: true },
);

const PlayItem: Model<IPlayItem> =
  mongoose.models.playitem || mongoose.model<IPlayItem>("playitem", playItemSchema);

export default PlayItem;
