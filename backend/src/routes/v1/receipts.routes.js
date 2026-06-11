const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image receipts are supported'));
    }
    cb(null, true);
  },
});

router.post('/scan', authenticateToken, upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Extract the details from this receipt and output them STRICTLY as a JSON object with the following schema, and absolutely no markdown wrapping, code blocks, or extra text:
{
  "storeName": "Store Name",
  "date": "YYYY-MM-DD",
  "items": [{"name": "Item 1", "price": 10.00}, {"name": "Item 2", "price": 5.50}],
  "tax": 1.50,
  "total": 17.00
}`;

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up markdown in case it slips in
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to process receipt with AI' });
  }
});

module.exports = router;
