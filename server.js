// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, {
  maxAge: "1d"
}));

// MongoDB Atlas Setup
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "radiquolab_db";
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

// Eager database connection check on boot
connectToDatabase()
  .then(() => console.log(" Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Form Submission Endpoint
app.post("/api/submit", async (req, res) => {
  try {
    const { services, budget, timeline, email, message } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 1. Save Document in MongoDB
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection("submissions");

    const newSubmission = {
      services: services || [],
      budget: budget || "Not specified",
      timeline: timeline || "Not specified",
      email: email.trim(),
      message: message ? message.trim() : "No message provided",
      submittedAt: new Date()
    };

    const result = await collection.insertOne(newSubmission);
    console.log("New submission inserted into MongoDB:", result.insertedId);

    // 2. Dispatch Email Notification
    const mailOptions = {
      from: `"Radiquolab Design Agency Alerts" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `⚡ New Project Brief from ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1.5px solid #080f3d; border-radius: 12px;">
          <h2 style="color: #1434cb; margin-top: 0;">New Project Brief Received</h2>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 15px 0;" />
          
          <p><strong>Client Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Selected Services:</strong> ${services && services.length > 0 ? services.join(", ") : "None selected"}</p>
          <p><strong>Estimated Budget:</strong> ${budget || "Not specified"}</p>
          <p><strong>Timeline:</strong> ${timeline || "Not specified"}</p>
          
          <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #1434cb; border-radius: 4px;">
            <strong>Message:</strong>
            <p style="margin: 8px 0 0 0; color: #334155; white-space: pre-line;">${message || "No additional message."}</p>
          </div>
          
          <p style="margin-top: 25px; font-size: 0.8rem; color: #64748b;">
            MongoDB Document ID: ${result.insertedId}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Email notification sent successfully.");

    return res.status(200).json({
      success: true,
      message: "Brief stored and email sent successfully",
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error("Submission/Mail error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process brief submission"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});