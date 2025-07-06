import mongoose from "mongoose";

const connectDB = (uri) => {
  mongoose
    .connect(uri)
    .then((data) => {
      console.log(`MongoDB connected successfully : ${data.connection.host}`);
    })
    .catch((err) => {
      throw err;
    });
};

export { connectDB };
