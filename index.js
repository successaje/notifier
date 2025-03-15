const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
require("dotenv").config();
app.use(express.json());

// Configure Nodemailer (using SendGrid as an example)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Use "Gmail", "Outlook", or other services
  port: 465,
  secure: true,
  auth: {
    user: "successaje5@gmail.com", 
    pass: process.env.PASSWORD, 
  },
});

app.get("/", (req, res) => {
    res.send("Hello, Heroku!");
});

// API endpoint to send emails
app.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body; //! Might add from aswell

  const mailOptions = {
    from: '"Gamebloc" <successaje5@gmail.com>', // Sender email address
    to,                            // Recipient email address
    subject,                       // Email subject
    text: body,                    // Email body (plain text)
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Notifier running on http://localhost:${PORT}`);
});

