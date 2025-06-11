require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Serve static files from the current directory
app.use(express.static(__dirname));

app.post('/generate-resume', async (req, res) => {
  try {
    const data = req.body;

    const prompt = `
You are a professional resume writer. Create a resume in clean HTML for a candidate applying for a ${data.targetRole} position.

Candidate Info:
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
Experience: ${data.experience}
Education: ${data.education}
Skills: ${data.skills.join(', ')}
Previous Work: ${data.workExperience}
Company Name: ${data.companyName}

Only return the HTML for the resume, no explanation.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    );

    const result = await response.json();

    // Extract the generated HTML from the response
    let html = '';
    if (
      result &&
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0] &&
      result.candidates[0].content.parts[0].text
    ) {
      html = result.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API response:', result);
      return res.status(500).json({ error: 'Invalid response from Gemini API', details: result });
    }

    res.json({ html });
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
