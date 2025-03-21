const express = require("express");
const nodemailer = require("nodemailer");
const axios = require('axios');
const app = express();
require("dotenv").config();
app.use(express.json());


const CLASH_ROYALE_API_KEY = process.env.CLASH_ROYALE_API_KEY;
const CLASHROYALE_BASE_URL = 'https://api.clashroyale.com/v1';

app.use((req, res, next) => {
  req.headers['Authorization'] = `Bearer ${CLASH_ROYALE_API_KEY}`;
  next();
});

async function makeApiRequest(url) {
  try {
      const response = await axios.get(url, {
          headers: {
              Authorization: `Bearer ${API_KEY}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message);
      throw error;
  }
}

// * Endpoint: Get player information
app.get('/players/:playerTag', async (req, res) => {
  try {
      // Replace '#' with '%23' according to the documentation here: https://developer.clashroyale.com/#/documentation
      const playerTag = req.params.playerTag.replace('#', '%23'); 
      const url = `${BASE_URL}/players/${playerTag}`;
      const playerInfo = await makeApiRequest(url);
      res.json(playerInfo);
  } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// * Endpoint: Get player's upcoming chests
app.get('/players/:playerTag/upcomingchests', async (req, res) => {
  try {
      const playerTag = req.params.playerTag.replace('#', '%23');
      const url = `${BASE_URL}/players/${playerTag}/upcomingchests`;
      const chestsInfo = await makeApiRequest(url);
      res.json(chestsInfo);
  } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// * Endpoint: Get player's battle log
app.get('/players/:playerTag/battlelog', async (req, res) => {
  try {
      const playerTag = req.params.playerTag.replace('#', '%23');
      const url = `${BASE_URL}/players/${playerTag}/battlelog`;
      const battleLog = await makeApiRequest(url);
      res.json(battleLog);
  } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Endpoint: Search tournaments by name
app.get('/tournaments', async (req, res) => {
  try {
      const { name, limit, after, before } = req.query;
      let url = `${BASE_URL}/tournaments`;

      // Build query parameters
      const queryParams = [];
      if (name) queryParams.push(`name=${encodeURIComponent(name)}`);
      if (limit) queryParams.push(`limit=${limit}`);
      if (after) queryParams.push(`after=${after}`);
      if (before) queryParams.push(`before=${before}`);

      if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
      }

      const tournaments = await makeApiRequest(url);
      res.json(tournaments);
  } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Endpoint: Get tournament information by tag
app.get('/tournaments/:tournamentTag', async (req, res) => {
  try {
      const tournamentTag = req.params.tournamentTag.replace('#', '%23'); 
      const url = `${BASE_URL}/tournaments/${tournamentTag}`;
      const tournamentInfo = await makeApiRequest(url);
      res.json(tournamentInfo);
  } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465,
  secure: true,
  auth: {
    user: "successaje5@gmail.com", 
    pass: process.env.PASSWORD, 
  },
});

app.get("/", (req, res) => {
    res.send("Hello!");
});

async function getPlayerProfile(playerTag) {
  try {
      const response = await axios.get(`${BASE_URL}/players/%23${playerTag.replace('#', '')}`, {
          headers: {
              Authorization: `Bearer ${API_KEY}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching player profile:', error.response ? error.response.data : error.message);
      throw error;
  }
}

// API endpoint to send emails
app.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body; //! Might add from aswell

  const mailOptions = {
    from: '"Gamebloc" <contact@gamebloc.app>', 
    to,                            
    subject,                      
    text: body,             
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

