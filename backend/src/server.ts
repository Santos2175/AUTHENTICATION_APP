import express from 'express';
import dotenv from 'dotenv';

import { connectToMongoDB } from './config/db.js';

dotenv.config();

// port initialization
const PORT = process.env.PORT || 5000;

// app initialization
const app = express();

// middlewares
app.use(express.json());

// api routes
app.get('/', async (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server running at https://localhost/${PORT}`);
});
