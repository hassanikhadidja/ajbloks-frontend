import mongoose, { Document, Model, Schema } from "mongoose";

export type ReturnRequestType =
  | "retour"
  | "echange"
  | "reclamation"
  | "contact";

export type ReturnRequestStatus =
  | "nouvelle"
  | "en_cours"
  | "attente_client"
  | "resolue"
  | "annulee";

export interface IReturnRequest extends Document {
  name: string;
  email: string;
  phone: string;
  comment: string;
  wilaya: string;
  requestType: ReturnRequestType;
  trackingNumber: string;
  buyerContact: string;
  pictures: string[];
  source: "retours" | "contact";
  status: ReturnRequestStatus;
}

const returnRequestSchema = new Schema<IReturnRequest>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    comment: { type: String, required: true, trim: true },
    wilaya: { type: String, default: "", trim: true },
    requestType: {
      type: String,
      enum: ["retour", "echange", "reclamation", "contact"],
      required: true,
    },
    trackingNumber: { type: String, default: "", trim: true },
    buyerContact: { type: String, default: "", trim: true },
    pictures: [{ type: String }],
    source: { type: String, enum: ["retours", "contact"], required: true },
    status: {
      type: String,
      enum: ["nouvelle", "en_cours", "attente_client", "resolue", "annulee"],
      default: "nouvelle",
    },
  },
  { timestamps: true },
);

const ReturnRequest: Model<IReturnRequest> =
  mongoose.models.returnrequest ||
  mongoose.model<IReturnRequest>("returnrequest", returnRequestSchema);

export default ReturnRequest;
