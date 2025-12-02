/**
 * MCP Resources for SVT Text-TV
 *
 * Resources provide read-only data that can be referenced in conversations.
 */

import { TextTVClient } from 'texttv-api';
import { DEFAULT_APP_ID, CATEGORIES, NEWS_PAGES, SPORTS_PAGES, WEATHER_PAGES, TV_SCHEDULE_PAGES } from '../config/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

/**
 * Resource definition
 */
export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Available resources
 */
export const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'texttv://categories',
    name: 'Text-TV Categories',
    description: 'List of available Text-TV categories with page ranges',
    mimeType: 'application/json',
  },
  {
    uri: 'texttv://news/latest',
    name: 'Latest News',
    description: 'Current main news from Text-TV page 100',
    mimeType: 'application/json',
  },
  {
    uri: 'texttv://sports/latest',
    name: 'Latest Sports',
    description: 'Current sports headlines from Text-TV page 300',
    mimeType: 'application/json',
  },
  {
    uri: 'texttv://weather/national',
    name: 'National Weather',
    description: 'Current national weather forecast from Text-TV page 400',
    mimeType: 'application/json',
  },
  {
    uri: 'texttv://tv/today',
    name: "Today's TV Schedule",
    description: 'Current TV schedule for SVT1 and SVT2',
    mimeType: 'application/json',
  },
];

/**
 * Get categories resource
 */
async function getCategoriesResource() {
  return {
    categories: Object.entries(CATEGORIES).map(([key, value]) => ({
      id: key,
      label: value.label,
      labelEn: value.labelEn,
      pageRange: {
        start: value.start,
        end: value.end,
      },
    })),
    knownPages: {
      news: NEWS_PAGES,
      sports: SPORTS_PAGES,
      weather: WEATHER_PAGES,
      tvSchedule: TV_SCHEDULE_PAGES,
    },
  };
}

/**
 * Get latest news resource
 */
async function getLatestNewsResource() {
  const page = await client.getPage(NEWS_PAGES.MAIN, { includePlainText: true });

  return {
    page: page.num,
    title: page.title,
    content: page.content,
    contentPlain: page.content_plain,
    updatedAt: new Date(page.date_updated_unix * 1000).toISOString(),
  };
}

/**
 * Get latest sports resource
 */
async function getLatestSportsResource() {
  const page = await client.getPage(SPORTS_PAGES.MAIN, { includePlainText: true });

  return {
    page: page.num,
    title: page.title,
    content: page.content,
    contentPlain: page.content_plain,
    updatedAt: new Date(page.date_updated_unix * 1000).toISOString(),
  };
}

/**
 * Get national weather resource
 */
async function getNationalWeatherResource() {
  const page = await client.getPage(WEATHER_PAGES.NATIONAL, { includePlainText: true });

  return {
    page: page.num,
    region: 'national',
    content: page.content,
    contentPlain: page.content_plain,
    updatedAt: new Date(page.date_updated_unix * 1000).toISOString(),
  };
}

/**
 * Get today's TV schedule resource
 */
async function getTodaysTVResource() {
  const [svt1, svt2] = await Promise.all([
    client.getPage(TV_SCHEDULE_PAGES.SVT1, { includePlainText: true }),
    client.getPage(TV_SCHEDULE_PAGES.SVT2, { includePlainText: true }),
  ]);

  return {
    svt1: {
      page: svt1.num,
      content: svt1.content,
      contentPlain: svt1.content_plain,
      updatedAt: new Date(svt1.date_updated_unix * 1000).toISOString(),
    },
    svt2: {
      page: svt2.num,
      content: svt2.content,
      contentPlain: svt2.content_plain,
      updatedAt: new Date(svt2.date_updated_unix * 1000).toISOString(),
    },
  };
}

/**
 * Handle resource read request
 */
export async function handleResourceRead(uri: string): Promise<unknown> {
  switch (uri) {
    case 'texttv://categories':
      return getCategoriesResource();

    case 'texttv://news/latest':
      return getLatestNewsResource();

    case 'texttv://sports/latest':
      return getLatestSportsResource();

    case 'texttv://weather/national':
      return getNationalWeatherResource();

    case 'texttv://tv/today':
      return getTodaysTVResource();

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}
