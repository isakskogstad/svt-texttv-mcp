/**
 * texttv_browse_category - Browse pages in a category
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, categoryKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID, CATEGORIES, type TextTVCategoryType } from '../config/index.js';
import { browseCategoryInputSchema, type BrowseCategoryInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface CategoryPageInfo {
  page: number;
  title?: string;
  updatedAt: string;
  updatedUnix: number;
  content?: string;
  contentPlain?: string;
}

export interface BrowseCategoryResult {
  category: string;
  categoryLabel: string;
  categoryLabelEn: string;
  pageRange: { start: number; end: number };
  pageCount: number;
  pages: CategoryPageInfo[];
}

/**
 * Browse pages in a specific category
 */
export async function browseCategory(input: unknown): Promise<BrowseCategoryResult> {
  const { category, includeContent, limit } = validateInput(browseCategoryInputSchema, input);

  const categoryInfo = CATEGORIES[category as TextTVCategoryType];
  if (!categoryInfo) {
    throw new Error(`Invalid category: ${category}`);
  }

  // Check cache
  const cacheKeyStr = categoryKey(category, includeContent);
  const cached = cache.get<BrowseCategoryResult>(cacheKeyStr);
  if (cached) {
    return {
      ...cached,
      pages: cached.pages.slice(0, limit),
      pageCount: Math.min(cached.pageCount, limit),
    };
  }

  // Determine how many pages to fetch
  const fetchEnd = Math.min(categoryInfo.start + limit - 1, categoryInfo.end);

  // Fetch from API
  const pagesMap = await client.getPageRange(categoryInfo.start, fetchEnd, {
    includePlainText: includeContent,
  });

  const pages: CategoryPageInfo[] = [];
  for (const [pageNum, subpage] of pagesMap.entries()) {
    const pageInfo: CategoryPageInfo = {
      page: subpage.num,
      title: subpage.title,
      updatedAt: new Date(subpage.date_updated_unix * 1000).toISOString(),
      updatedUnix: subpage.date_updated_unix,
    };

    if (includeContent) {
      pageInfo.content = subpage.content;
      pageInfo.contentPlain = subpage.content_plain;
    }

    pages.push(pageInfo);
  }

  // Sort by page number
  pages.sort((a, b) => a.page - b.page);

  const result: BrowseCategoryResult = {
    category,
    categoryLabel: categoryInfo.label,
    categoryLabelEn: categoryInfo.labelEn,
    pageRange: { start: categoryInfo.start, end: categoryInfo.end },
    pageCount: pages.length,
    pages,
  };

  // Cache result
  cache.set(cacheKeyStr, result, CACHE_TTL.CATEGORY);

  return result;
}

/**
 * Tool definition for MCP
 */
export const browseCategoryTool = {
  name: 'texttv_browse_category',
  description: 'Browse pages in a Text-TV category. Get a list of available pages with optional content.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string',
        enum: ['news', 'sports', 'weather', 'tv_schedule', 'other'],
        description: 'Category to browse: news (100-199), sports (300-399), weather (400-499), tv_schedule (500-699), other (700-899)',
      },
      includeContent: {
        type: 'boolean',
        description: 'Include page content (slower, more data)',
        default: false,
      },
      limit: {
        type: 'number',
        description: 'Maximum number of pages to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 20,
      },
    },
    required: ['category'],
  },
  annotations: {
    title: 'Browse Text-TV Category',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
