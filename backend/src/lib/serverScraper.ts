// src/lib/serverScraper.ts
// This file runs on the server (e.g., in a Next.js API route, or a dedicated Node.js server)

import axios from 'axios';
import * as cheerio from 'cheerio'; // Use cheerio for server-side HTML parsing

export interface ScrapedData {
  content: string;
  colors: string[];
  title: string;
  description: string;
}

// Function to scrape website data (server-side)
export async function scrapeWebsiteData(websiteUrl: string): Promise<ScrapedData> {
  console.group('🌐 Website Scraping Started');
  console.log('URL:', websiteUrl);
  
  try {
    const response = await axios.get(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 seconds timeout
    });

    const htmlContent = response.data;
    const $ = cheerio.load(htmlContent);

    // Remove scripts, styles, nav, footer, header for cleaner text extraction
    $('script, style, nav, footer, header').remove();

    // Extract text content from the body
    const textContent = $('body').text() || $.text();
    const cleanContent = textContent.replace(/\s+/g, ' ').trim();

    // Extract title and description
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';

    // Extract colors
    const colors = extractColorsFromHTML(htmlContent);

    console.log('📝 Scraped Title:', title);
    console.log('📄 Description:', description);
    console.log('🎨 Extracted Colors:', colors);
    console.log('📚 Content Preview:', cleanContent.substring(0, 200) + '...');
    console.groupEnd();

    return {
      content: cleanContent.substring(0, 3000),
      colors,
      title,
      description
    };
  } catch (error) {
    console.error('Scraping Error:', error.message);
    console.groupEnd();
    return {
      content: '',
      colors: ['#2563eb', '#1e40af', '#3b82f6'],
      title: '',
      description: ''
    };
  }
}

// Extract colors from HTML content (simplified for server-side)
function extractColorsFromHTML(html: string): string[] {
  const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)/g;
  const colors = new Set<string>();

  // Attempt to find color patterns in the first part of the HTML
  let match;
  while ((match = colorRegex.exec(html.substring(0, 10000))) !== null) { // Limit search to first 10KB
    colors.add(match[0]);
  }

  const colorArray = Array.from(colors).slice(0, 5); // Get up to 5 colors

  if (colorArray.length === 0) {
    return ['#2563eb', '#1e40af', '#3b82f6']; // Default if none found
  }

  // Ensure at least 3 colors
  while (colorArray.length < 3) {
    colorArray.push('#6b7280'); // Default gray
  }

  return colorArray.slice(0, 3); // Return top 3
}