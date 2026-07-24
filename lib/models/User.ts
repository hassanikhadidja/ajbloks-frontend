import mongoose, { Document, Model, Schema } from "mongoose";

export type KidsClubPromoCodeDoc = {
  code: string;
  tier: number;
  cycle: number;
  used: boolean;
  createdAt: Date;
};

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: "admin" | "client";
  kidsClubBirthday?: string;
  kidsClubBirthdayLocked?: boolean;
  kidsClubPromoCodes?: KidsClubPromoCodeDoc[];
  addresses?: string[];
  marketingEmail?: boolean;
}

const kidsClubPromoSchema = new Schema(
  {
    code: { type: String, required: true },
    tier: { type: Number, required: true },
    cycle: { type: Number, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["admin", "client"], default: "client" },
  kidsClubBirthday: { type: String, default: "" },
  kidsClubBirthdayLocked: { type: Boolean, default: false },
  kidsClubPromoCodes: { type: [kidsClubPromoSchema], default: [] },
  addresses: { type: [String], default: [] },
  marketingEmail: { type: Boolean, default: true },
});

if (
  mongoose.models.user &&
  (!mongoose.models.user.schema.path("kidsClubBirthday") ||
    !mongoose.models.user.schema.path("kidsClubPromoCodes") ||
    !mongoose.models.user.schema.path("addresses") ||
    !mongoose.models.user.schema.path("marketingEmail"))
) {
  delete mongoose.models.user;
}

const User: Model<IUser> =
  mongoose.models.user || mongoose.model<IUser>("user", userSchema);

export default User;
