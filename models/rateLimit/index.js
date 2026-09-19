import mongoose from "mongoose";

// One document per (rule, client, time window). MongoDB deletes it once
// `expiresAt` passes, so the collection never grows.
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export default mongoose.model("RateLimit", rateLimitSchema);
