import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.MONGODB;

const connectedDB = async () => {
  try {
    const db = await mongoose.connect(URL, {
      dbName: "Silent-reminder",
    });
    console.log("DATA BASE IS CONNECTED");
  } catch (error) {
    console.log("DATA BASE ERROR", error.message);
  }
};
export default connectedDB;
