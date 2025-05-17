
# Blog Publisher Script Guide for AI Automation

This guide explains how to use the `blog-publisher.ts` script to automate the creation of blog posts for the website. The script handles authentication, content creation with various section types, and API interaction.

## Overview

The blog publisher script:
1. Authenticates with admin credentials
2. Creates structured blog posts with different section types
3. Supports uploading images, text, quotes, lists, and headings
4. Validates content before publishing
5. Can save drafts as JSON files

## Blog Structure

Each blog post consists of:

- **Title** (required): The main title of the blog post
- **Excerpt** (required): A brief summary (10-150 characters) that appears in listings
- **Featured Image URL** (optional): The main image shown at the top of the post
- **Tags** (optional): Array of keywords related to the content
- **Sections** (required): Array of content sections with different types and properties

## Section Types

The blog system supports these section types:

### 1. Text Section
```json
{
  "type": "text",
  "content": "Your paragraph text goes here. Can include multiple paragraphs and basic formatting.",
  "alignment": "left" // Options: "left", "center", "right"
}
```

### 2. Image Section
```json
{
  "type": "image",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Optional description of the image",
  "alignment": "center" // Options: "left", "center", "right"
}
```

### 3. Quote Section
```json
{
  "type": "quote",
  "content": "The quote text goes here",
  "caption": "Attribution or source"
}
```

### 4. Heading Section
```json
{
  "type": "heading",
  "content": "Heading Text",
  "level": 2 // Options: 2, 3, 4 (corresponding to H2, H3, H4)
}
```

### 5. List Section
```json
{
  "type": "list",
  "items": [
    "First list item",
    "Second list item",
    "Third list item"
  ]
}
```

## How to Use

1. **Configure Authentication**:
   - Provide admin email and password
   - Set the correct API base URL

2. **Create a Blog Post**:
   - Define the blog structure with title, excerpt, and sections
   - Use helper methods to create properly formatted sections
   - Add appropriate tags for categorization
   
3. **Publish the Post**:
   - Call the `authenticate()` method first
   - Then call the `createBlogPost()` method with your blog data

## Helper Methods

The script provides these helper methods for creating sections:

- `BlogPublisher.createTextSection(content, alignment)`
- `BlogPublisher.createImageSection(imageUrl, caption, alignment)`
- `BlogPublisher.createQuoteSection(content, caption)`
- `BlogPublisher.createHeadingSection(content, level)`
- `BlogPublisher.createListSection(items)`

## Best Practices for AI Blog Generation

When generating blogs with AI, consider these guidelines:

1. **Structure**: Create a logical flow with introduction, main content, and conclusion
2. **Section Variety**: Mix different section types to improve readability
3. **Image Usage**: Include relevant images with descriptive captions
4. **Headings**: Use proper heading hierarchy (H2 for main sections, H3 for subsections)
5. **Lists**: Break down complex information into bullet points where appropriate
6. **Tags**: Add 3-6 relevant tags that match the blog content
7. **Excerpts**: Write concise, enticing excerpts that summarize the main value
8. **Length**: Aim for 800-1500 words total across all text sections

## Error Handling

The script includes error handling for common issues:
- Authentication failures
- Validation errors
- Network problems
- API errors

Review the console output for detailed error messages if publishing fails.

## JSON Templates

Use the provided template files as starting points to create new blog posts. You can save and load blog posts as JSON files using:
- `BlogPublisher.loadBlogFromFile(filePath)`  
- `BlogPublisher.saveBlogToFile(blogPost, filePath)`
