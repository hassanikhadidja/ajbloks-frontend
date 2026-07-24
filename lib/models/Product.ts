import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProductQa {
  q: string;
  a: string;
}

export interface IProductColor {
  name?: string;
  hex: string;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  price: number;
  img: string[];
  description: string;
  age_plus: number;
  age?: string;
  ageTranche?: string;
  isEducational: boolean;
  category: string;
  tags: string[];
  sizes: string[];
  rating: number;
  stock: number;
  nbr_commande: number;
  articles: string[];
  characteristics: string;
  character: string;
  warning: string;
  whyLoveIt: string[];
  qa: IProductQa[];
  isBook: boolean;
  isTrending: boolean;
  hasMultipleColors: boolean;
  colors: IProductColor[];
}

const qaSchema = new Schema<IProductQa>(
  { q: { type: String, required: true }, a: { type: String, required: true } },
  { _id: false },
);

const colorSchema = new Schema<IProductColor>(
  {
    name: { type: String, default: "" },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    img: { type: [String], default: [] },
    description: { type: String, required: true },
    age_plus: { type: Number, min: 0, default: 3, required: true },
    age: { type: String, default: "3Y+" },
    ageTranche: { type: String, default: "" },
    isEducational: { type: Boolean, default: false },
    category: { type: String, default: "", required: true, trim: true },
    tags: [{ type: String, trim: true }],
    sizes: {
      type: [String],
      enum: ["small", "medium", "large", "standard", "one-size"],
      default: ["standard"],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, required: true, default: 100 },
    nbr_commande: { type: Number, default: 0 },
    articles: [{ type: String }],
    characteristics: { type: String, default: "" },
    character: { type: String, default: "" },
    warning: { type: String, default: "" },
    whyLoveIt: [{ type: String }],
    qa: [qaSchema],
    isBook: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    hasMultipleColors: { type: Boolean, default: false },
    colors: { type: [colorSchema], default: [] },
  },
  { timestamps: true },
);

const Product: Model<IProduct> =
  mongoose.models.product || mongoose.model<IProduct>("product", productSchema);

export default Product;
