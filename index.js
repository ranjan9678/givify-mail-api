import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Webmail API Working ✅");
});

// Optional GET route for testing
app.get("/send-mail", (req, res) => {
  res.send("Send-mail route exists. Use POST request to send email.");
});

// POST route → Send email
app.post("/send-mail", async (req, res) => {
  console.log("Incoming Data:", req.body); // 👈 DEBUG

  const {
    productName,
    name,
    email,
    countryCode,
    phone,
    location,
    quantity,
    message,
  } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email and message are required!" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "New Product Enquiry",
      html: `
        <h2>New Enquiry Received</h2>
        <p><b>Product:</b> ${productName || "-"}</p>
        <p><b>Name / Company:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${countryCode || ""} ${phone || "-"}</p>
        <p><b>Location:</b> ${location || "-"}</p>
        <p><b>Quantity:</b> ${quantity || "-"}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({
      success: true,
      message: "Form data sent to webmail successfully ✅",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Email sending failed ❌",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
