/**
 * texttv_search - Search across Text-TV pages
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, searchKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID, CATEGORIES, type TextTVCategoryType } from '../config/index.js';
import { searchInputSchema, type SearchInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface SearchResultPage {
  page: number;
  title?: string;
  content: string;
  contentPlain?: string;
  matchContext?: string;
  updatedAt: string;
  updatedUnix: number;
}

export interface SearchResult {
  query: string;
  category?: string;
  totalResults: number;
  results: SearchResultPage[];
}

/**
 * Extract context around a match
 */
function extractMatchContext(content: string, query: string, contextLength: number = 100): string | undefined {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerContent.indexOf(lowerQuery);

  if (index === -1) return undefined;

  const start = Math.max(0, index - contextLength);
  const end = Math.min(content.length, index + query.length + contextLength);

  let context = content.slice(start, end);

  // Clean up HTML tags for context display
  context = context.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (start > 0) context = '...' + context;
  if (end < content.length) context = context + '...';

  return context;
}

/**
 * Search across Text-TV pages
 */
export async function search(input: unknown): Promise<SearchResult> {
  const { query, category, maxResults, includePlainText } = validateInput(searchInputSchema, input);

  // Determine search range
  let startPage: number;
  let endPage: number;

  if (category && CATEGORIES[category]) {
    startPage = CATEGORIES[category].start;
    endPage = CATEGORIES[category].end;
  } else {
    // Search all pages - but limit to avoid too many requests
    startPage = 100;
    endPage = 199; // Just news by default if no category
  }

  // Check cache
  const cacheKeyStr = searchKey(query, startPage, endPage);
  const cached = cache.get<SearchResult>(cacheKeyStr);
  if (cached) {
    // Apply maxResults filter to cached results
    return {
      ...cached,
      results: cached.results.slice(0, maxResults),
      totalResults: Math.min(cached.totalResults, maxResults),
    };
  }

  // Use the client's search method
  const searchResults = await client.search(query, startPage, endPage, { includePlainText });

  const results: SearchResultPage[] = [];
  for (const [pageNum, subpage] of searchResults.entries()) {
    const searchContent = includePlainText && subpage.content_plain
      ? subpage.content_plain
      : subpage.content;

    results.push({
      page: subpage.num,
      title: subpage.title,
      content: subpage.content,
      contentPlain: subpage.content_plain,
      matchContext: extractMatchContext(searchContent, query),
      updatedAt: new Date(subpage.date_updated_unix * 1000).toISOString(),
      updatedUnix: subpage.date_updated_unix,
    });
  }

  // Sort by page number
  results.sort((a, b) => a.page - b.page);

  const fullResult: SearchResult = {
    query,
    category,
    totalResults: results.length,
    results,
  };

  // Cache full results
  cache.set(cacheKeyStr, fullResult, CACHE_TTL.SEARCH);

  // Return with maxResults limit
  return {
    ...fullResult,
    results: results.slice(0, maxResults),
    totalResults: Math.min(results.length, maxResults),
  };
}

/**
 * Tool definition for MCP
 */
export const searchTool = {
  name: 'texttv_search',
  description: 'Search for content across SVT Text-TV pages. Optionally filter by category (news, sports, weather, tv_schedule).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query string',
        minLength: 1,
        maxLength: 100,
      },
      category: {
        type: 'string',
        enum: ['news', 'sports', 'weather', 'tv_schedule', 'other'],
        description: 'Category to search within (optional)',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return (1-50)',
        minimum: 1,
        maximum: 50,
        default: 10,
      },
      includePlainText: {
        type: 'boolean',
        description: 'Include plain text content without HTML formatting',
        default: false,
      },
    },
    required: ['query'],
  },
  annotations: {
    title: 'Search Text-TV',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
