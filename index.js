import express from "express";
import connectedDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth/index.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello world",
  });
});

app.use("/api/auth", authRoutes);

const startServer = async () => {
  try {
    await connectedDB();
    app.listen(PORT, () => {
      console.log(`server is ready http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Server error", error);
  }
};

startServer();
