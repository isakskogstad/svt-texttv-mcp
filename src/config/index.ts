/**
 * Configuration and constants for SVT Text-TV MCP Server
 */

/** Server info */
export const SERVER_INFO = {
  name: 'svt-texttv-mcp',
  version: '1.0.0',
  description: 'MCP server for SVT Text-TV - Swedish teletext news, sports, weather, and TV schedules',
} as const;

/** Text-TV page ranges */
export const PAGE_RANGE = {
  MIN: 100,
  MAX: 899,
} as const;

/** News page ranges */
export const NEWS_PAGES = {
  MAIN: 100,
  DOMESTIC_START: 101,
  DOMESTIC_END: 103,
  FOREIGN_START: 104,
  FOREIGN_END: 109,
  FULL_START: 100,
  FULL_END: 130,
} as const;

/** Sports page ranges */
export const SPORTS_PAGES = {
  MAIN: 300,
  RESULTS: 301,
  FOOTBALL_START: 330,
  FOOTBALL_END: 339,
  HOCKEY_START: 340,
  HOCKEY_END: 349,
  FULL_START: 300,
  FULL_END: 399,
} as const;

/** Weather page ranges */
export const WEATHER_PAGES = {
  MAIN: 400,
  NATIONAL: 400,
  STOCKHOLM: 402,
  GOTHENBURG: 403,
  MALMO: 404,
  FORECASTS_START: 400,
  FORECASTS_END: 420,
} as const;

/** TV schedule pages */
export const TV_SCHEDULE_PAGES = {
  SVT1: 600,
  SVT2: 650,
  SVT1_START: 600,
  SVT1_END: 619,
  SVT2_START: 650,
  SVT2_END: 669,
} as const;

/** Category definitions */
export type TextTVCategoryType = 'news' | 'sports' | 'weather' | 'tv_schedule' | 'other';

export const CATEGORIES: Record<TextTVCategoryType, { start: number; end: number; label: string; labelEn: string }> = {
  news: { start: 100, end: 199, label: 'Nyheter', labelEn: 'News' },
  sports: { start: 300, end: 399, label: 'Sport', labelEn: 'Sports' },
  weather: { start: 400, end: 499, label: 'Väder', labelEn: 'Weather' },
  tv_schedule: { start: 500, end: 699, label: 'TV-tablå', labelEn: 'TV Schedule' },
  other: { start: 700, end: 899, label: 'Övrigt', labelEn: 'Other' },
} as const;

/** News categories */
export const NEWS_CATEGORIES = {
  main: 'main',
  domestic: 'domestic',
  foreign: 'foreign',
} as const;

export type NewsCategoryType = keyof typeof NEWS_CATEGORIES;

/** Sports categories */
export const SPORTS_CATEGORIES = {
  main: 'main',
  football: 'football',
  hockey: 'hockey',
  results: 'results',
} as const;

export type SportsCategoryType = keyof typeof SPORTS_CATEGORIES;

/** Weather regions */
export const WEATHER_REGIONS = {
  national: 'national',
  stockholm: 'stockholm',
  gothenburg: 'gothenburg',
  malmo: 'malmo',
} as const;

export type WeatherRegionType = keyof typeof WEATHER_REGIONS;

/** TV channels */
export const TV_CHANNELS = {
  svt1: 'svt1',
  svt2: 'svt2',
  both: 'both',
} as const;

export type TVChannelType = keyof typeof TV_CHANNELS;

/** Cache TTL values in milliseconds */
export const CACHE_TTL = {
  /** Single page - matches Text-TV refresh rate */
  PAGE: 15_000,
  /** Search results */
  SEARCH: 30_000,
  /** Category browse */
  CATEGORY: 30_000,
  /** Weather (changes less frequently) */
  WEATHER: 60_000,
  /** TV Schedule (rarely changes) */
  TV_SCHEDULE: 300_000,
} as const;

/** Default app ID for texttv.nu API */
export const DEFAULT_APP_ID = 'svt-texttv-mcp';

/** HTTP server defaults */
export const HTTP_DEFAULTS = {
  PORT: 10000,
  HOST: '0.0.0.0',
} as const;

/**
 * Get category for a page number
 */
export function getCategoryForPage(pageNum: number): TextTVCategoryType {
  if (pageNum >= 100 && pageNum < 200) return 'news';
  if (pageNum >= 300 && pageNum < 400) return 'sports';
  if (pageNum >= 400 && pageNum < 500) return 'weather';
  if (pageNum >= 500 && pageNum < 700) return 'tv_schedule';
  return 'other';
}

/**
 * Get page range for news category
 */
export function getNewsPagesForCategory(category: NewsCategoryType): { start: number; end: number } {
  switch (category) {
    case 'main':
      return { start: NEWS_PAGES.MAIN, end: NEWS_PAGES.MAIN };
    case 'domestic':
      return { start: NEWS_PAGES.DOMESTIC_START, end: NEWS_PAGES.DOMESTIC_END };
    case 'foreign':
      return { start: NEWS_PAGES.FOREIGN_START, end: NEWS_PAGES.FOREIGN_END };
    default:
      return { start: NEWS_PAGES.FULL_START, end: NEWS_PAGES.FULL_END };
  }
}

/**
 * Get page range for sports category
 */
export function getSportsPagesForCategory(category: SportsCategoryType): { start: number; end: number } {
  switch (category) {
    case 'main':
      return { start: SPORTS_PAGES.MAIN, end: SPORTS_PAGES.MAIN };
    case 'football':
      return { start: SPORTS_PAGES.FOOTBALL_START, end: SPORTS_PAGES.FOOTBALL_END };
    case 'hockey':
      return { start: SPORTS_PAGES.HOCKEY_START, end: SPORTS_PAGES.HOCKEY_END };
    case 'results':
      return { start: SPORTS_PAGES.RESULTS, end: SPORTS_PAGES.RESULTS };
    default:
      return { start: SPORTS_PAGES.FULL_START, end: SPORTS_PAGES.FULL_END };
  }
}

/**
 * Get page number for weather region
 */
export function getWeatherPageForRegion(region: WeatherRegionType): number {
  switch (region) {
    case 'national':
      return WEATHER_PAGES.NATIONAL;
    case 'stockholm':
      return WEATHER_PAGES.STOCKHOLM;
    case 'gothenburg':
      return WEATHER_PAGES.GOTHENBURG;
    case 'malmo':
      return WEATHER_PAGES.MALMO;
    default:
      return WEATHER_PAGES.NATIONAL;
  }
}

/**
 * Get page range for TV channel
 */
export function getTVSchedulePagesForChannel(channel: TVChannelType): { start: number; end: number } {
  switch (channel) {
    case 'svt1':
      return { start: TV_SCHEDULE_PAGES.SVT1_START, end: TV_SCHEDULE_PAGES.SVT1_END };
    case 'svt2':
      return { start: TV_SCHEDULE_PAGES.SVT2_START, end: TV_SCHEDULE_PAGES.SVT2_END };
    case 'both':
      return { start: TV_SCHEDULE_PAGES.SVT1_START, end: TV_SCHEDULE_PAGES.SVT2_END };
    default:
      return { start: TV_SCHEDULE_PAGES.SVT1_START, end: TV_SCHEDULE_PAGES.SVT2_END };
  }
}
