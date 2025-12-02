/**
 * texttv_get_subpages - Get all subpage versions of a Text-TV page
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, pageKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID } from '../config/index.js';
import { getSubpagesInputSchema, type GetSubpagesInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface SubpageResult {
  page: number;
  title?: string;
  content: string;
  contentPlain?: string;
  updatedAt: string;
  updatedUnix: number;
  id: string;
}

export interface GetSubpagesResult {
  page: number;
  subpageCount: number;
  subpages: SubpageResult[];
}

/**
 * Fetch all subpage versions of a Text-TV page
 */
export async function getSubpages(input: unknown): Promise<GetSubpagesResult> {
  const { page, includePlainText } = validateInput(getSubpagesInputSchema, input);

  // Check cache
  const cacheKeyStr = `subpages:${pageKey(page, includePlainText)}`;
  const cached = cache.get<GetSubpagesResult>(cacheKeyStr);
  if (cached) {
    return cached;
  }

  // Fetch from API - getAllSubpages returns all subpage versions
  const subpagesList = await client.getAllSubpages(page, { includePlainText });

  if (subpagesList.length === 0) {
    return {
      page,
      subpageCount: 0,
      subpages: [],
    };
  }

  const subpages: SubpageResult[] = subpagesList.map((sp) => ({
    page: sp.num,
    title: sp.title,
    content: sp.content,
    contentPlain: sp.content_plain,
    updatedAt: new Date(sp.date_updated_unix * 1000).toISOString(),
    updatedUnix: sp.date_updated_unix,
    id: sp.id,
  }));

  const result: GetSubpagesResult = {
    page,
    subpageCount: subpages.length,
    subpages,
  };

  // Cache result
  cache.set(cacheKeyStr, result, CACHE_TTL.PAGE);

  return result;
}

/**
 * Tool definition for MCP
 */
export const getSubpagesTool = {
  name: 'texttv_get_subpages',
  description: 'Get all subpage versions of a specific Text-TV page. Some pages have multiple subpages that rotate.',
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
    title: 'Get Text-TV Subpages',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
