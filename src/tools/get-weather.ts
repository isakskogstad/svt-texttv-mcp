/**
 * texttv_get_weather - Get weather forecasts from Text-TV
 */

import { TextTVClient, type TextTVSubpage } from 'texttv-api';
import { cache, pageKey } from '../cache/index.js';
import { CACHE_TTL, DEFAULT_APP_ID, getWeatherPageForRegion, type WeatherRegionType } from '../config/index.js';
import { getWeatherInputSchema, type GetWeatherInput, validateInput } from '../schemas/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

export interface GetWeatherResult {
  region: string;
  regionLabel: string;
  page: number;
  content: string;
  contentPlain?: string;
  updatedAt: string;
  updatedUnix: number;
}

const REGION_LABELS: Record<string, string> = {
  national: 'Sverige',
  stockholm: 'Stockholm',
  gothenburg: 'Göteborg',
  malmo: 'Malmö',
};

/**
 * Fetch weather forecast from Text-TV
 */
export async function getWeather(input: unknown): Promise<GetWeatherResult> {
  const { region, includePlainText } = validateInput(getWeatherInputSchema, input);
  const regionKey = region as WeatherRegionType;

  const page = getWeatherPageForRegion(regionKey);

  // Check cache
  const cacheKeyStr = `weather:${pageKey(page, includePlainText)}`;
  const cached = cache.get<GetWeatherResult>(cacheKeyStr);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const subpage = await client.getPage(page, { includePlainText });

  const result: GetWeatherResult = {
    region: regionKey,
    regionLabel: REGION_LABELS[regionKey] ?? regionKey,
    page: subpage.num,
    content: subpage.content,
    contentPlain: subpage.content_plain,
    updatedAt: new Date(subpage.date_updated_unix * 1000).toISOString(),
    updatedUnix: subpage.date_updated_unix,
  };

  // Cache result with longer TTL for weather
  cache.set(cacheKeyStr, result, CACHE_TTL.WEATHER);

  return result;
}

/**
 * Tool definition for MCP
 */
export const getWeatherTool = {
  name: 'texttv_get_weather',
  description: 'Get weather forecasts from SVT Text-TV. Available regions: national (page 400), stockholm (402), gothenburg (403), malmo (404).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      region: {
        type: 'string',
        enum: ['national', 'stockholm', 'gothenburg', 'malmo'],
        description: 'Weather region: national, stockholm, gothenburg, or malmo',
        default: 'national',
      },
      includePlainText: {
        type: 'boolean',
        description: 'Include plain text content without HTML formatting',
        default: false,
      },
    },
  },
  annotations: {
    title: 'Get Text-TV Weather',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};
