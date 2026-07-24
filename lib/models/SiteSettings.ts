import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSettings extends Document {
  key: string;
  value: string;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true },
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.sitesettings ||
  mongoose.model<ISiteSettings>("sitesettings", siteSettingsSchema);

export const PROMO_BAR_KEY = "promo-bar";
export const PROMO_BAR_DEFAULT =
  "Livraison gratuite pour les commandes de plus de 6500 DZD";

export default SiteSettings;
