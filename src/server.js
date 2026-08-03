// import dotenv from "dotenv";
import "dotenv/config";
import dns from "dns";

import app from "./app.js";
import connectDB from "./config/db.js";
import "./cron/attendanceCron.js";

// Load Environment Variables
// dotenv.config();

// Fix DNS issue (MongoDB Atlas)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});