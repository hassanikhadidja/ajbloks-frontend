import mongoose from "mongoose";

function getMongoUri() {
  const uri = process.env.uri || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MongoDB URI. Set `uri` or `MONGODB_URI` in .env.local");
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
