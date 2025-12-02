/**
 * texttv_get_page - Get a specific Text-TV page by number
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, pageKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID } from '../config/index.js';
import { getPageInputSchema, type GetPageInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface GetPageResult {
  page: number;
  title?: string;
  content: string;
  contentPlain?: string;
  updatedAt: string;
  updatedUnix: number;
  nextPage?: number;
  prevPage?: number;
}

/**
 * Fetch a specific Text-TV page
 */
export async function getPage(input: unknown): Promise<GetPageResult> {
  const { page, includePlainText } = validateInput(getPageInputSchema, input);

  // Check cache
  const cacheKeyStr = pageKey(page, includePlainText);
  const cached = cache.get<GetPageResult>(cacheKeyStr);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const subpage = await client.getPage(page, { includePlainText });

  const result: GetPageResult = {
    page: subpage.num,
    title: subpage.title,
    content: subpage.content,
    contentPlain: subpage.content_plain,
    updatedAt: new Date(subpage.date_updated_unix * 1000).toISOString(),
    updatedUnix: subpage.date_updated_unix,
    nextPage: subpage.next_page,
    prevPage: subpage.prev_page,
  };

  // Cache result
  cache.set(cacheKeyStr, result, CACHE_TTL.PAGE);

  return result;
}

/**
 * Tool definition for MCP
 */
export const getPageTool = {
  name: 'texttv_get_page',
  description: 'Get a specific SVT Text-TV page by number (100-899). Returns the page content with optional plain text formatting.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      page: {
        type: 'number',
        description: 'Text-TV page number (100-899)',
        minimum: 100,
        maximum: 899,
      },
      includePlainText: {
        type: 'boolean',
        description: 'Include plain text content without HTML formatting',
        default: false,
      },
    },
    required: ['page'],
  },
  annotations: {
    title: 'Get Text-TV Page',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
