require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.DASHBOARD_GENERATOR_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/claude', async (req, res) => {
    try {
      console.log('Sending request to Anthropic...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {       
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DASHBOARD_GENERATOR_CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(req.body)     
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(3001, () => console.log('Proxy server running on http://localhost:3001'));