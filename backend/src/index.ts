import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeWebsiteData } from '../../src/lib/serverScraper';
import { generatePageContent } from '../../src/lib/serverAIContentGenerator';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/api/generate-nose-content', async (req, res) => {
  try {
    const { doctorId, userId, doctorWebsite, doctorProfile } = req.body;

    if (!doctorProfile) {
      return res.status(400).json({ error: 'Doctor profile is required' });
    }

    const content = await generatePageContent(doctorProfile);
    res.json(content);
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});