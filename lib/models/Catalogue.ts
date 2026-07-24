import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICatalogue extends Document {
  title: string;
  buttonSentence: string;
  picture: string;
  pdfName: string;
  pdfUrl: string;
}

const catalogueSchema = new Schema<ICatalogue>(
  {
    title: { type: String, required: true },
    buttonSentence: { type: String, required: true },
    picture: { type: String, required: true },
    pdfName: { type: String, required: true },
    pdfUrl: { type: String, required: true },
  },
  { timestamps: true },
);

const Catalogue: Model<ICatalogue> =
  mongoose.models.catalogue || mongoose.model<ICatalogue>("catalogue", catalogueSchema);

export default Catalogue;
