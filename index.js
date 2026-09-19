import "dotenv/config";
import express from "express";
import cors from "cors";
import connectedDB from "./config/db.js";
import authRoutes from "./routes/auth/index.js";
import reminderRoutes from "./routes/reminder/index.js";
import { sendError } from "./utils/response.js";

for (const name of ["JWT_SECRET", "MONGODB"]) {
  if (!process.env[name]) {
    console.error(`Missing required env variable: ${name}`);
    process.exit(1);
  }
}

const app = express();
app.disable("x-powered-by");
// Behind Vercel/a proxy: use the forwarded client IP (needed for rate limiting).
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Silent Reminder API" });
});

app.use("/api/auth", authRoutes);
app.use("/api", reminderRoutes);

app.use((req, res) => sendError(res, 404, "Route not found."));

// Catches malformed JSON bodies and anything else thrown outside a controller.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return sendError(res, 400, "Invalid JSON body.");
  }
  console.error(err);
  return sendError(res, 500, "Something went wrong. Please try again.");
});

const startServer = async () => {
  try {
    await connectedDB();
    app.listen(PORT, () => {
      console.log(`server is ready http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server error", error.message);
    process.exit(1);
  }
};

startServer();
