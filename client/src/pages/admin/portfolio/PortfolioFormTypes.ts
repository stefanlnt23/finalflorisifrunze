import { z } from "zod";
import { insertPortfolioItemSchema } from "@shared/schema";

// Extend the schema with validation
export const formSchema = insertPortfolioItemSchema.extend({
  // Add any additional validation here
  serviceId: z.any(), // Allow any type for serviceId
});

export type FormValues = z.infer<typeof formSchema>;

// Image pair type for before/after images
export type ImagePair = {
  before: string;
  after: string;
  caption?: string;
  order: number;
  richDescription?: string;
};

// Helper function to generate SEO tags from title and description
export const generateSeoTags = (
  title: string, 
  description: string,
  setValue: (name: any, value: any) => void,
  showToast: any
) => {
  if (!title && !description) {
    showToast({
      title: "Missing Information",
      description: "Please add a title and description first",
      variant: "destructive",
    });
    return;
  }

  // Extract keywords from title and description
  const combinedText = `${title} ${description}`;
  const words = combinedText.toLowerCase().split(/\s+/);
  const commonWords = ["the", "and", "or", "a", "an", "in", "on", "at", "to", "for", "with", "by", "of", "from"];
  const filteredWords = words.filter(word => 
    word.length > 3 && !commonWords.includes(word)
  );

  // Count word frequency
  const wordCount: Record<string, number> = {};
  filteredWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and get top 5
  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  // Add gardening-related keywords
  const gardeningKeywords = ["gardening", "landscaping", "plants", "garden", "outdoor"];
  const tags = Array.from(new Set([...sortedWords, ...gardeningKeywords])).slice(0, 8);

  // Update form
  setValue("seo.tags", tags);
  setValue("seo.metaTitle", title);
  setValue("seo.metaDescription", description.substring(0, 160));

  showToast({
    title: "SEO Tags Generated",
    description: "Tags have been generated based on your content",
  });
};

// Helper functions for image pairs
export const addImagePair = (
  imagePairs: ImagePair[], 
  setImagePairs: React.Dispatch<React.SetStateAction<ImagePair[]>>
) => {
  setImagePairs([
    ...imagePairs,
    { before: "", after: "", caption: "", order: imagePairs.length }
  ]);
};

export const removeImagePair = (
  index: number, 
  imagePairs: ImagePair[], 
  setImagePairs: React.Dispatch<React.SetStateAction<ImagePair[]>>,
  showToast: any
) => {
  if (imagePairs.length > 1) {
    const newPairs = [...imagePairs];
    newPairs.splice(index, 1);
    // Update order values
    newPairs.forEach((pair, idx) => {
      pair.order = idx;
    });
    setImagePairs(newPairs);
  } else {
    showToast({
      title: "Cannot Remove",
      description: "You must have at least one image pair",
      variant: "destructive",
    });
  }
};

export const moveImagePairUp = (
  index: number, 
  imagePairs: ImagePair[], 
  setImagePairs: React.Dispatch<React.SetStateAction<ImagePair[]>>
) => {
  if (index > 0) {
    const newPairs = [...imagePairs];
    const temp = newPairs[index];
    newPairs[index] = newPairs[index - 1];
    newPairs[index - 1] = temp;
    // Update order values
    newPairs.forEach((pair, idx) => {
      pair.order = idx;
    });
    setImagePairs(newPairs);
  }
};

export const moveImagePairDown = (
  index: number, 
  imagePairs: ImagePair[], 
  setImagePairs: React.Dispatch<React.SetStateAction<ImagePair[]>>
) => {
  if (index < imagePairs.length - 1) {
    const newPairs = [...imagePairs];
    const temp = newPairs[index];
    newPairs[index] = newPairs[index + 1];
    newPairs[index + 1] = temp;
    // Update order values
    newPairs.forEach((pair, idx) => {
      pair.order = idx;
    });
    setImagePairs(newPairs);
  }
};

export const updateImagePair = (
  index: number, 
  field: 'before' | 'after' | 'caption' | 'richDescription',
  value: string, 
  imagePairs: ImagePair[], 
  setImagePairs: React.Dispatch<React.SetStateAction<ImagePair[]>>
) => {
  const newPairs = [...imagePairs];
  newPairs[index] = { ...newPairs[index], [field]: value };
  setImagePairs(newPairs);
};