import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "radiquolab_db";
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MONGODB_URI environment variable is missing");
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
      services: Array.isArray(services) ? services : [],
      budget: budget || "Not specified",
      timeline: timeline || "Not specified",
      email: email.trim(),
      message: message ? message.trim() : "No message provided",
      submittedAt: new Date(),
    };

    const result = await collection.insertOne(newSubmission);
    console.log("Atlas write successful, ID:", result.insertedId);

    // 2. Nodemailer Transporter Setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const targetRecipient = process.env.EMAIL_TO || process.env.EMAIL_USER;
    console.log(`Sending email from [${process.env.EMAIL_USER}] to [${targetRecipient}]...`);

    const info = await transporter.sendMail({
      from: `"Radiquolab Alerts" <${process.env.EMAIL_USER}>`,
      to: targetRecipient,
      replyTo: email.trim(),
      subject: `⚡ New Project Brief from ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1.5px solid #080f3d; border-radius: 12px;">
          <h2 style="color: #1434cb; margin-top: 0;">New Project Brief Received</h2>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 15px 0;" />
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Services:</strong> ${services && services.length > 0 ? services.join(", ") : "None specified"}</p>
          <p><strong>Budget:</strong> ${budget || "Not specified"}</p>
          <p><strong>Timeline:</strong> ${timeline || "Not specified"}</p>
          <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border-left: 4px solid #1434cb; border-radius: 4px;">
            <strong>Message:</strong>
            <p style="margin: 6px 0 0 0; color: #334155; white-space: pre-line;">${message || "No additional message."}</p>
          </div>
          <p style="margin-top: 20px; font-size: 0.8rem; color: #64748b;">
            Atlas ID: ${result.insertedId}
          </p>
        </div>
      `,
    });

    console.log("SMTP Response:", info.response);
    console.log("Accepted Recipient(s):", info.accepted);
    console.log("Rejected Recipient(s):", info.rejected);

    return res.status(200).json({
      success: true,
      message: "Submission stored and email dispatched",
      insertedId: result.insertedId,
      messageId: info.messageId,
      smtpResponse: info.response,
    });
  } catch (error) {
    console.error("Vercel Function / Mail Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Submission failed",
    });
  }
}