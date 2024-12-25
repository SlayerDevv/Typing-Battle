import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('ur database/ur table').then(()=>console.log("DB Connected"));

}