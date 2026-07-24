import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStore extends Document {
  name: string;
  location: string;
  website: string;
  mapLink: string;
  storeType: string;
  lat: number | null;
  lng: number | null;
}

const storeSchema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    website: { type: String, default: "" },
    mapLink: { type: String, default: "" },
    storeType: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { timestamps: true },
);

// Hot-reload safe: recreate model if newer paths are missing from a cached schema
if (
  mongoose.models.store &&
  (!mongoose.models.store.schema.path("mapLink") ||
    !mongoose.models.store.schema.path("storeType"))
) {
  delete mongoose.models.store;
}

const Store: Model<IStore> =
  mongoose.models.store || mongoose.model<IStore>("store", storeSchema);

export default Store;
