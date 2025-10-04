import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('DB connected');
    } catch (error) {
        console.error('DB connection failed:', error);
    }
};
