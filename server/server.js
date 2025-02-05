import express from 'express';
// import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { initializeSocket } from './Socket/Socket.js';
import os from "os"

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;


const corsOptions = {
  origin: '*', 
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

const getWifiIp = () => {
  const interfaces = os.networkInterfaces();
  let wifiIp = "127.0.0.1"; // Default fallback

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal && name.includes("Wi-Fi")) {
        wifiIp = iface.address;
      }
    }
  }

  return wifiIp;
};


app.get("/ip", (req, res) => {
  res.send(getWifiIp());
});


app.get("/",(req ,res) => {
res.send('server is running')
})

server.listen(port, "0.0.0.0",() => {
  console.log(`Server running on port ${port}`);
});