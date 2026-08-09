import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for high-resolution base64 images
app.use(express.json({ limit: '50mb' }));

// Helper to initialize GoogleGenAI safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean base64 string
function cleanBase64(base64Data: string): { data: string; mimeType: string } {
  let mimeType = 'image/jpeg';
  let data = base64Data;

  if (base64Data.startsWith('data:')) {
    const parts = base64Data.split(';base64,');
    if (parts.length === 2) {
      mimeType = parts[0].replace('data:', '');
      data = parts[1];
    }
  }
  return { data, mimeType };
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Primary Image Classification Endpoint
app.post('/api/classify', async (req, res) => {
  try {
    const { image, customCategories, datasetName, mode } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image payload is required.' });
    }

    const { data: base64Data, mimeType } = cleanBase64(image);
    const ai = getGenAI();

    // Build context prompt if user has provided custom categories
    let customCategoriesPrompt = '';
    if (customCategories && Array.isArray(customCategories) && customCategories.length > 0) {
      customCategoriesPrompt = `\nCUSTOM DATASET CATEGORIES (${datasetName || 'User Custom Dataset'}):\n`;
      customCategories.forEach((cat: any, idx: number) => {
        customCategoriesPrompt += `- Category ID: "${cat.id}", Name: "${cat.name}", Description: "${cat.description || 'No description'}"\n`;
      });
      customCategoriesPrompt += `\nCRITICAL MANDATE FOR CUSTOM DATASET MATCHING:
Compare the input image against the custom dataset categories provided above. 
1. Determine if the image belongs to one of these custom categories.
2. Provide a confidence score (0 to 100) for each custom category.
3. Identify distinguishing features that match or differ from the custom categories.
`;
    }

    const systemInstruction = `You are a world-class AI Image Recognition and Computer Vision Analyst.
Your task is to perform thorough visual object classification, confidence estimation, and category analysis on the user's uploaded photo.

Output requirements:
- Analyze the primary subject, scene, visual elements, and context.
- Identify the primary category and assign a precise confidence score (0.0 to 100.0%).
- Provide a breakdown of confidence scores across multiple candidate categories (including general categories and any user custom dataset categories).
- Detect key visual objects/components in the image with normalized 2D bounding boxes in [ymin, xmin, ymax, xmax] format (scale 0 to 1000).
- Extract visual attributes like lighting, composition, main subject, dominant color hex codes, background type, and image quality.
- Provide tags, a custom dataset match evaluation, and a comprehensive, clear visual explanation.
${customCategoriesPrompt}`;

    const prompt = `Analyze this image in detail. Categorize it, compute confidence scores for all potential classes, detect objects with bounding boxes, and evaluate matches against custom categories if present. Return the result in strictly valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryCategory: {
              type: Type.STRING,
              description: 'Name of the main recognized category or class.',
            },
            primaryConfidence: {
              type: Type.NUMBER,
              description: 'Overall confidence percentage (0.0 to 100.0).',
            },
            confidenceBreakdown: {
              type: Type.ARRAY,
              description: 'List of candidate categories with confidence scores summing up to ~100%.',
              items: {
                type: Type.OBJECT,
                properties: {
                  categoryName: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                  isCustomCategory: { type: Type.BOOLEAN },
                },
                required: ['categoryName', 'confidence', 'reasoning'],
              },
            },
            detectedObjects: {
              type: Type.ARRAY,
              description: 'Key visual objects detected in the photo with bounding boxes.',
              items: {
                type: Type.OBJECT,
                properties: {
                  objectName: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  box2d: {
                    type: Type.ARRAY,
                    description: '[ymin, xmin, ymax, xmax] coordinates normalized to 0-1000',
                    items: { type: Type.INTEGER },
                  },
                  description: { type: Type.STRING },
                },
                required: ['objectName', 'confidence'],
              },
            },
            attributes: {
              type: Type.OBJECT,
              properties: {
                lighting: { type: Type.STRING },
                composition: { type: Type.STRING },
                mainSubject: { type: Type.STRING },
                dominantColors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                imageQuality: { type: Type.STRING },
                backgroundType: { type: Type.STRING },
                estimatedScene: { type: Type.STRING },
              },
            },
            customDatasetMatch: {
              type: Type.OBJECT,
              properties: {
                bestMatchedCategoryId: { type: Type.STRING },
                bestMatchedCategoryName: { type: Type.STRING },
                matchScore: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
                distinguishingFeatures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            detailedExplanation: {
              type: Type.STRING,
              description: 'Clear, insightful paragraph explaining the visual features used for this classification.',
            },
          },
          required: [
            'primaryCategory',
            'primaryConfidence',
            'confidenceBreakdown',
            'detectedObjects',
            'attributes',
            'tags',
            'detailedExplanation',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini AI.');
    }

    const parsedResult = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Classification error:', error);
    return res.status(500).json({
      error: 'Failed to classify image.',
      details: error.message || String(error),
    });
  }
});

// Batch Image Classification Endpoint
app.post('/api/batch-classify', async (req, res) => {
  try {
    const { items, customCategories, datasetName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required.' });
    }

    const ai = getGenAI();
    const results = [];

    // Process each item
    for (const item of items) {
      try {
        const { image, fileName, id } = item;
        const { data: base64Data, mimeType } = cleanBase64(image);

        let customCategoriesPrompt = '';
        if (customCategories && Array.isArray(customCategories) && customCategories.length > 0) {
          customCategoriesPrompt = `\nCUSTOM DATASET CATEGORIES (${datasetName || 'User Custom Dataset'}):\n`;
          customCategories.forEach((cat: any) => {
            customCategoriesPrompt += `- "${cat.name}": ${cat.description || 'No description'}\n`;
          });
        }

        const systemInstruction = `You are a visual image classifier. Perform rapid batch image categorization and confidence scoring. Return valid JSON only. ${customCategoriesPrompt}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: 'Classify this image, provide confidence scores and custom category match if applicable.' },
            ],
          },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                primaryCategory: { type: Type.STRING },
                primaryConfidence: { type: Type.NUMBER },
                confidenceBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      categoryName: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                      reasoning: { type: Type.STRING },
                    },
                  },
                },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                detailedExplanation: { type: Type.STRING },
              },
              required: ['primaryCategory', 'primaryConfidence', 'confidenceBreakdown', 'tags', 'detailedExplanation'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        results.push({
          id,
          fileName,
          status: 'completed',
          result: {
            id,
            imageUrl: image,
            timestamp: new Date().toISOString(),
            primaryCategory: parsed.primaryCategory || 'Uncategorized',
            primaryConfidence: parsed.primaryConfidence || 0,
            confidenceBreakdown: parsed.confidenceBreakdown || [],
            detectedObjects: [],
            attributes: {},
            tags: parsed.tags || [],
            detailedExplanation: parsed.detailedExplanation || '',
          },
        });
      } catch (itemErr: any) {
        results.push({
          id: item.id,
          fileName: item.fileName,
          status: 'failed',
          error: itemErr.message || 'Error processing image',
          result: null,
        });
      }
    }

    return res.json({ success: true, results });
  } catch (error: any) {
    console.error('Batch classification error:', error);
    return res.status(500).json({ error: error.message || 'Batch operation failed.' });
  }
});

// Optional Synthetic Image Generation for Dataset Custom Categories
app.post('/api/generate-sample-image', async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    if (!categoryName) {
      return res.status(400).json({ error: 'categoryName is required.' });
    }

    const ai = getGenAI();
    const prompt = `A clear, high-quality, centered reference photograph of: ${categoryName}. ${description ? 'Context: ' + description : ''}. White or neutral studio background, ideal as a training sample image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
    });

    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error('Image generation failed to return inline image data.');
    }

    return res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Sample generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate sample image.' });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
