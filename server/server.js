import express from 'express';
// import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { initializeSocket } from './Socket/Socket.js';


dotenv.config();
const app = express();
const port = process.env.PORT || 4000;


const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};


// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
//app.use('ur endpoint',class)


// Connect to MongoDB
// connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});