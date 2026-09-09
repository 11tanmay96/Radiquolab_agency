import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { services, budget, timeline, email, message } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 1. Insert to Atlas
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection("submissions");

    const newSubmission = {
      services: services || [],
      budget: budget || "Not specified",
      timeline: timeline || "Not specified",
      email: email.trim(),
      message: message ? message.trim() : "No message provided",
      submittedAt: new Date(),
    };

    const result = await collection.insertOne(newSubmission);

    // 2. Send Email via Gmail App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Radiquolab Alerts" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `⚡ New Project Brief from ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1.5px solid #080f3d; border-radius: 10px;">
          <h2 style="color: #1434cb;">New Project Brief Received</h2>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Services:</strong> ${services && services.length > 0 ? services.join(", ") : "None"}</p>
          <p><strong>Budget:</strong> ${budget || "Not specified"}</p>
          <p><strong>Timeline:</strong> ${timeline || "Not specified"}</p>
          <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border-left: 4px solid #1434cb;">
            <strong>Message:</strong>
            <p style="margin: 6px 0 0 0;">${message || "No additional message."}</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Submission stored and email dispatched",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ success: false, message: "Submission failed" });
  }
}