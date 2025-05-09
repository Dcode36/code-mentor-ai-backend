const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { clerkMiddleware, clerkClient } = require('@clerk/express');
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const solutionRoutes = require('./routes/solutionRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware({
  apiKey: process.env.CLERK_PUBLISHABLE_KEY,
  apiVersion: '1'
}));

app.get('/', async (req, res) => {
  console.log("API is running...");
  res.send("API is running...");
});
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/gemini', geminiRoutes)
const PORT = 8900 || process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
