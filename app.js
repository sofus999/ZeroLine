import express from 'express';
import dotenv from 'dotenv';
import alertRoutes from './routes/alerts.js';
import cmdbRoutes from './routes/cmdb.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json()); // Parse incoming JSON requests

// Serve static files from "public" directory
app.use(express.static('public'));

// API route for alerts
app.use('/api/alerts', alertRoutes);

// Use the CMDB routes with the base path `/cmdb`
app.use('/cmdb', cmdbRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
