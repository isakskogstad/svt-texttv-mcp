/**
 * Tool registry - exports all MCP tools and their handlers
 */

import { getPage, getPageTool } from './get-page.js';
import { getSubpages, getSubpagesTool } from './get-subpages.js';
import { getNews, getNewsTool } from './get-news.js';
import { getSports, getSportsTool } from './get-sports.js';
import { getWeather, getWeatherTool } from './get-weather.js';
import { getTVSchedule, getTVScheduleTool } from './get-tv-schedule.js';
import { search, searchTool } from './search.js';
import { browseCategory, browseCategoryTool } from './browse-category.js';

/**
 * Tool definitions for MCP registration
 */
export const TOOLS = [
  getPageTool,
  getSubpagesTool,
  getNewsTool,
  getSportsTool,
  getWeatherTool,
  getTVScheduleTool,
  searchTool,
  browseCategoryTool,
] as const;

/**
 * Tool handlers mapped by name
 */
export const TOOL_HANDLERS: Record<string, (input: unknown) => Promise<unknown>> = {
  texttv_get_page: getPage,
  texttv_get_subpages: getSubpages,
  texttv_get_news: getNews,
  texttv_get_sports: getSports,
  texttv_get_weather: getWeather,
  texttv_get_tv_schedule: getTVSchedule,
  texttv_search: search,
  texttv_browse_category: browseCategory,
};

/**
 * Handle a tool call by name
 */
export async function handleToolCall(name: string, args: unknown): Promise<unknown> {
  const handler = TOOL_HANDLERS[name];

  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return handler(args);
}

// Re-export individual tools
export {
  getPage,
  getPageTool,
  getSubpages,
  getSubpagesTool,
  getNews,
  getNewsTool,
  getSports,
  getSportsTool,
  getWeather,
  getWeatherTool,
  getTVSchedule,
  getTVScheduleTool,
  search,
  searchTool,
  browseCategory,
  browseCategoryTool,
};
