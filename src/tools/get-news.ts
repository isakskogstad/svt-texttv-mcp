/**
 * texttv_get_news - Get news from Text-TV
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, pageRangeKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID, getNewsPagesForCategory, type NewsCategoryType } from '../config/index.js';
import { getNewsInputSchema, type GetNewsInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface NewsPageResult {
  page: number;
  title?: string;
  content: string;
  contentPlain?: string;
  updatedAt: string;
  updatedUnix: number;
}

export interface GetNewsResult {
  category: string;
  categoryLabel: string;
  pageCount: number;
  pages: NewsPageResult[];
}

const CATEGORY_LABELS: Record<string, string> = {
  main: 'Huvudnyheter',
  domestic: 'Inrikes',
  foreign: 'Utrikes',
};

/**
 * Fetch news pages from Text-TV
 */
export async function getNews(input: unknown): Promise<GetNewsResult> {
  const { category, includePlainText } = validateInput(getNewsInputSchema, input);
  const categoryKey = category as NewsCategoryType;

  const { start, end } = getNewsPagesForCategory(categoryKey);

  // Check cache
  const cacheKeyStr = `news:${pageRangeKey(start, end, includePlainText)}`;
  const cached = cache.get<GetNewsResult>(cacheKeyStr);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const pagesMap = await client.getPageRange(start, end, { includePlainText });

  const pages: NewsPageResult[] = [];
  for (const [pageNum, subpage] of pagesMap.entries()) {
    pages.push({
      page: subpage.num,
      title: subpage.title,
      content: subpage.content,
      contentPlain: subpage.content_plain,
      updatedAt: new Date(subpage.date_updated_unix * 1000).toISOString(),
      updatedUnix: subpage.date_updated_unix,
    });
  }

  // Sort by page number
  pages.sort((a, b) => a.page - b.page);

  const result: GetNewsResult = {
    category: categoryKey,
    categoryLabel: CATEGORY_LABELS[categoryKey] ?? categoryKey,
    pageCount: pages.length,
    pages,
  };

  // Cache result
  cache.set(cacheKeyStr, result, CACHE_TTL.PAGE);

  return result;
}

/**
 * Tool definition for MCP
 */
export const getNewsTool = {
  name: 'texttv_get_news',
  description: 'Get news from SVT Text-TV. Categories: main (page 100), domestic (inrikes, pages 101-103), foreign (utrikes, pages 104-109).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string',
        enum: ['main', 'domestic', 'foreign'],
        description: 'News category: main (page 100), domestic (inrikes), foreign (utrikes)',
        default: 'main',
      },
      includePlainText: {
        type: 'boolean',
        description: 'Include plain text content without HTML formatting',
        default: false,
      },
    },
  },
  annotations: {
    title: 'Get Text-TV News',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
