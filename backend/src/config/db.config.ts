import mongoose from 'mongoose';

export const connectToMongoDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error(
        `Mongo connection uri string is missing. Please include it in your .env`
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB..');
  } catch (error) {
    console.error(`Error connecting to MongoDB`);
    process.exit(1);
  }
};
