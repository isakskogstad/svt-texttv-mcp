/**
 * Zod schemas for MCP tool input validation
 */

import { z } from 'zod';
import {
  PAGE_RANGE,
  NEWS_CATEGORIES,
  SPORTS_CATEGORIES,
  WEATHER_REGIONS,
  TV_CHANNELS,
  CATEGORIES,
} from '../config/index.js';

/**
 * Page number schema (100-899)
 */
export const pageNumberSchema = z
  .number()
  .int()
  .min(PAGE_RANGE.MIN, `Page number must be at least ${PAGE_RANGE.MIN}`)
  .max(PAGE_RANGE.MAX, `Page number must be at most ${PAGE_RANGE.MAX}`)
  .describe('Text-TV page number (100-899)');

/**
 * Include plain text option schema
 */
export const includePlainTextSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe('Include plain text content without HTML formatting');

/**
 * texttv_get_page input schema
 */
export const getPageInputSchema = z.object({
  page: pageNumberSchema,
  includePlainText: includePlainTextSchema,
});

export type GetPageInput = z.infer<typeof getPageInputSchema>;

/**
 * texttv_get_subpages input schema
 */
export const getSubpagesInputSchema = z.object({
  page: pageNumberSchema,
  includePlainText: includePlainTextSchema,
});

export type GetSubpagesInput = z.infer<typeof getSubpagesInputSchema>;

/**
 * News category schema
 */
export const newsCategorySchema = z
  .enum(['main', 'domestic', 'foreign'] as const)
  .optional()
  .default('main')
  .describe('News category: main (page 100), domestic (inrikes), foreign (utrikes)');

/**
 * texttv_get_news input schema
 */
export const getNewsInputSchema = z.object({
  category: newsCategorySchema,
  includePlainText: includePlainTextSchema,
});

export type GetNewsInput = z.infer<typeof getNewsInputSchema>;

/**
 * Sports category schema
 */
export const sportsCategorySchema = z
  .enum(['main', 'football', 'hockey', 'results'] as const)
  .optional()
  .default('main')
  .describe('Sports category: main, football, hockey, or results');

/**
 * texttv_get_sports input schema
 */
export const getSportsInputSchema = z.object({
  category: sportsCategorySchema,
  includePlainText: includePlainTextSchema,
});

export type GetSportsInput = z.infer<typeof getSportsInputSchema>;

/**
 * Weather region schema
 */
export const weatherRegionSchema = z
  .enum(['national', 'stockholm', 'gothenburg', 'malmo'] as const)
  .optional()
  .default('national')
  .describe('Weather region: national, stockholm, gothenburg, or malmo');

/**
 * texttv_get_weather input schema
 */
export const getWeatherInputSchema = z.object({
  region: weatherRegionSchema,
  includePlainText: includePlainTextSchema,
});

export type GetWeatherInput = z.infer<typeof getWeatherInputSchema>;

/**
 * TV channel schema
 */
export const tvChannelSchema = z
  .enum(['svt1', 'svt2', 'both'] as const)
  .optional()
  .default('both')
  .describe('TV channel: svt1, svt2, or both');

/**
 * texttv_get_tv_schedule input schema
 */
export const getTVScheduleInputSchema = z.object({
  channel: tvChannelSchema,
  includePlainText: includePlainTextSchema,
});

export type GetTVScheduleInput = z.infer<typeof getTVScheduleInputSchema>;

/**
 * Text-TV category for browsing/searching
 */
export const texttvCategorySchema = z
  .enum(['news', 'sports', 'weather', 'tv_schedule', 'other'] as const)
  .optional()
  .describe('Text-TV category to filter by');

/**
 * texttv_search input schema
 */
export const searchInputSchema = z.object({
  query: z.string().min(1).max(100).describe('Search query string'),
  category: texttvCategorySchema,
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .describe('Maximum number of results to return (1-50)'),
  includePlainText: includePlainTextSchema,
});

export type SearchInput = z.infer<typeof searchInputSchema>;

/**
 * texttv_browse_category input schema
 */
export const browseCategoryInputSchema = z.object({
  category: z
    .enum(['news', 'sports', 'weather', 'tv_schedule', 'other'] as const)
    .describe('Category to browse'),
  includeContent: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include page content (slower, more data)'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Maximum number of pages to return (1-100)'),
});

export type BrowseCategoryInput = z.infer<typeof browseCategoryInputSchema>;

/**
 * Validate and parse input with Zod schema
 */
export function validateInput<T>(schema: z.ZodType<T>, input: unknown): T {
  return schema.parse(input);
}

/**
 * Safely validate input, returning result object
 */
export function safeValidateInput<T>(
  schema: z.ZodType<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
