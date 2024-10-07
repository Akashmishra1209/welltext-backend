const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")

// Use environment variable for MongoDB URI
const uri = process.env.MONGODB_URI || "mongodb+srv://root:akash%40996@welltext.80rv5.mongodb.net/welltext-backend?retryWrites=true&w=majority&appName=WellText"; // Fallback for local development
const app = express();
// Cors Options
// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'https://welltext.vercel.app'], // Add your frontend domain(s) here
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors(corsOptions))

// Connect to MongoDB function
async function connectMongoDB() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        return mongoose.connection.db.collection("features_requests");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// Get list of feature requests
app.get('/api/list', async (req, res) => {
    try {
        const collection = await connectMongoDB();
        const data = await collection.find().toArray();
        res.status(200).json(data); // Send data as JSON with status 200
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).send("Error fetching documents from database");
    }
});

// Add a new feature request
app.post('/api/add', async (req, res) => {
    try {
        const collection = await connectMongoDB();
        const result = await collection.insertOne(req.body);
        res.status(201).json({ message: "Document added successfully", result }); // Return success message
    } catch (error) {
        console.error("Error adding document:", error);
        res.status(500).send("Error adding document to database");
    }
});

// Delete a feature request by ID
app.delete('/api/delete/:id', async (req, res) => {
    try {
        const collection = await connectMongoDB();
        const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        
        if (result.deletedCount === 0) {
            res.status(404).send("Document not found");
        } else {
            res.status(200).send("Document deleted successfully");
        }
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).send("Error deleting document from database");
    }
});

// Export the app for Vercel
module.exports = app;
