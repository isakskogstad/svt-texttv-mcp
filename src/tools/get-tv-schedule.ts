/**
 * texttv_get_tv_schedule - Get TV schedules from Text-TV
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, pageRangeKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID, getTVSchedulePagesForChannel, type TVChannelType } from '../config/index.js';
import { getTVScheduleInputSchema, type GetTVScheduleInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface TVSchedulePageResult {
  page: number;
  channel: string;
  title?: string;
  content: string;
  contentPlain?: string;
  updatedAt: string;
  updatedUnix: number;
}

export interface GetTVScheduleResult {
  channel: string;
  channelLabel: string;
  pageCount: number;
  pages: TVSchedulePageResult[];
}

const CHANNEL_LABELS: Record<string, string> = {
  svt1: 'SVT1',
  svt2: 'SVT2',
  both: 'SVT1 & SVT2',
};

function getChannelForPage(pageNum: number): string {
  if (pageNum >= 600 && pageNum < 650) return 'SVT1';
  if (pageNum >= 650 && pageNum < 700) return 'SVT2';
  return 'Unknown';
}

/**
 * Fetch TV schedule from Text-TV
 */
export async function getTVSchedule(input: unknown): Promise<GetTVScheduleResult> {
  const { channel, includePlainText } = validateInput(getTVScheduleInputSchema, input);
  const channelKey = channel as TVChannelType;

  const { start, end } = getTVSchedulePagesForChannel(channelKey);

  // Check cache
  const cacheKeyStr = `tvschedule:${pageRangeKey(start, end, includePlainText)}`;
  const cached = cache.get<GetTVScheduleResult>(cacheKeyStr);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const pagesMap = await client.getPageRange(start, end, { includePlainText });

  const pages: TVSchedulePageResult[] = [];
  for (const [pageNum, subpage] of pagesMap.entries()) {
    pages.push({
      page: subpage.num,
      channel: getChannelForPage(subpage.num),
      title: subpage.title,
      content: subpage.content,
      contentPlain: subpage.content_plain,
      updatedAt: new Date(subpage.date_updated_unix * 1000).toISOString(),
      updatedUnix: subpage.date_updated_unix,
    });
  }

  // Sort by page number
  pages.sort((a, b) => a.page - b.page);

  const result: GetTVScheduleResult = {
    channel: channelKey,
    channelLabel: CHANNEL_LABELS[channelKey] ?? channelKey,
    pageCount: pages.length,
    pages,
  };

  // Cache result with longer TTL for TV schedule
  cache.set(cacheKeyStr, result, CACHE_TTL.TV_SCHEDULE);

  return result;
}

/**
 * Tool definition for MCP
 */
export const getTVScheduleTool = {
  name: 'texttv_get_tv_schedule',
  description: 'Get TV schedules from SVT Text-TV. Channels: svt1 (pages 600-619), svt2 (pages 650-669), or both.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channel: {
        type: 'string',
        enum: ['svt1', 'svt2', 'both'],
        description: 'TV channel: svt1, svt2, or both',
        default: 'both',
      },
      includePlainText: {
        type: 'boolean',
        description: 'Include plain text content without HTML formatting',
        default: false,
      },
    },
  },
  annotations: {
    title: 'Get Text-TV TV Schedule',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
