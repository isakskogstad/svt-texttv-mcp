/**
 * texttv_get_sports - Get sports content from Text-TV
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, pageRangeKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID, getSportsPagesForCategory, type SportsCategoryType } from '../config/index.js';
import { getSportsInputSchema, type GetSportsInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface SportsPageResult {
  page: number;
  title?: string;
  content: string;
  contentPlain?: string;
  updatedAt: string;
  updatedUnix: number;
}

export interface GetSportsResult {
  category: string;
  categoryLabel: string;
  pageCount: number;
  pages: SportsPageResult[];
}

const CATEGORY_LABELS: Record<string, string> = {
  main: 'Sport',
  football: 'Fotboll',
  hockey: 'Hockey',
  results: 'Resultat',
};

/**
 * Fetch sports pages from Text-TV
 */
export async function getSports(input: unknown): Promise<GetSportsResult> {
  const { category, includePlainText } = validateInput(getSportsInputSchema, input);
  const categoryKey = category as SportsCategoryType;

  const { start, end } = getSportsPagesForCategory(categoryKey);

  // Check cache
  const cacheKeyStr = `sports:${pageRangeKey(start, end, includePlainText)}`;
  const cached = cache.get<GetSportsResult>(cacheKeyStr);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const pagesMap = await client.getPageRange(start, end, { includePlainText });

  const pages: SportsPageResult[] = [];
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

  const result: GetSportsResult = {
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
export const getSportsTool = {
  name: 'texttv_get_sports',
  description: 'Get sports content from SVT Text-TV. Categories: main (page 300), football (pages 330-339), hockey (pages 340-349), results (page 301).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string',
        enum: ['main', 'football', 'hockey', 'results'],
        description: 'Sports category: main, football, hockey, or results',
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
    title: 'Get Text-TV Sports',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
