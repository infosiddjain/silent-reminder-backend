import mongoose from "mongoose";

const connectedDB = async () => {
  if (!process.env.MONGODB) throw new Error("MONGODB env variable is missing");

  await mongoose.connect(process.env.MONGODB, { dbName: "Silent-reminder" });
  console.log("DATA BASE IS CONNECTED");
};

export default connectedDB;
