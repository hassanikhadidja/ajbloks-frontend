import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IOrderItemColor {
  name?: string;
  hex: string;
}

export interface IOrderItem {
  productId?: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  img: string;
  selectedColor?: IOrderItemColor;
}

export interface IOrder extends Document {
  customerName: string;
  phone: string;
  email?: string;
  wilaya: string;
  commune: string;
  userId?: Types.ObjectId | null;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  note: string;
  trackingCode: string;
  paymentMethod?: string;
  promoCode?: string;
  discount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemColorSchema = new Schema<IOrderItemColor>(
  {
    name: { type: String, default: "" },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "product" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    img: { type: String, default: "" },
    selectedColor: { type: orderItemColorSchema, default: undefined },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    wilaya: { type: String, required: true },
    commune: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", default: null },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    note: { type: String, default: "" },
    trackingCode: { type: String, unique: true, sparse: true },
    paymentMethod: { type: String, default: "cod" },
    promoCode: { type: String, default: "" },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BK-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

if (
  mongoose.models.order &&
  (!mongoose.models.order.schema.path("promoCode") ||
    !mongoose.models.order.schema.path("discount"))
) {
  delete mongoose.models.order;
}

const Order: Model<IOrder> =
  mongoose.models.order || mongoose.model<IOrder>("order", orderSchema);

export default Order;
