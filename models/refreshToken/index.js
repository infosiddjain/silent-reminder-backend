import mongoose from "mongoose";

// Only a SHA-256 hash of the refresh token is stored, so a database leak does not
// expose usable tokens. MongoDB removes expired rows automatically.
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
