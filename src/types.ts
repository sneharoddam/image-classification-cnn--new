export interface DetectedObject {
  objectName: string;
  confidence: number; // 0 to 100
  box2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  description?: string;
}

export interface CategoryConfidence {
  categoryName: string;
  confidence: number; // 0 to 100
  reasoning: string;
  isCustomCategory?: boolean;
}

export interface CustomDatasetMatch {
  bestMatchedCategoryId: string | null;
  bestMatchedCategoryName: string | null;
  matchScore: number; // 0 to 100
  reasoning: string;
  distinguishingFeatures: string[];
}

export interface ImageAttributes {
  lighting?: string;
  composition?: string;
  mainSubject?: string;
  dominantColors?: string[];
  imageQuality?: string;
  backgroundType?: string;
  estimatedScene?: string;
}

export interface ImageClassificationResult {
  id: string;
  imageUrl: string;
  timestamp: string;
  primaryCategory: string;
  primaryConfidence: number;
  confidenceBreakdown: CategoryConfidence[];
  detectedObjects: DetectedObject[];
  attributes: ImageAttributes;
  customDatasetMatch?: CustomDatasetMatch;
  tags: string[];
  detailedExplanation: string;
  datasetNameUsed?: string;
}

export interface SampleImage {
  id: string;
  url: string;
  caption?: string;
  addedAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  samples: SampleImage[];
}

export interface CustomDataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isPreset?: boolean;
  categories: CustomCategory[];
}

export interface BatchItemResult {
  fileName: string;
  result: ImageClassificationResult | null;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
