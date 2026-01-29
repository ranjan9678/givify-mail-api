import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

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
    return res.status(400).json({
      success: false,
      message: "Name, email and message are required!",
    });
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

    return res.status(200).json({
      success: true,
      message: "Email sent successfully ✅",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email sending failed ❌",
      error: error.message,
    });
  }
}
