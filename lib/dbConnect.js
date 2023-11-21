import mongoose from "mongoose";

export const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log("Error connection to MongoDB:", error);
    }
}