/**
 * MCP Prompts for SVT Text-TV
 *
 * Pre-built prompt templates for common Text-TV queries.
 */

import { TextTVClient } from 'texttv-api';
import { DEFAULT_APP_ID, NEWS_PAGES, SPORTS_PAGES, WEATHER_PAGES } from '../config/index.js';

const client = new TextTVClient({ appId: DEFAULT_APP_ID });

/**
 * Prompt argument definition
 */
export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

/**
 * Prompt definition
 */
export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: PromptArgument[];
}

/**
 * Available prompts
 */
export const PROMPTS: PromptDefinition[] = [
  {
    name: 'swedish_news_summary',
    description: 'Get a summary of current Swedish news from Text-TV',
    arguments: [
      {
        name: 'focus',
        description: 'Focus area: domestic, foreign, or all',
        required: false,
      },
    ],
  },
  {
    name: 'sports_update',
    description: 'Get latest sports updates and results from Text-TV',
    arguments: [
      {
        name: 'sport',
        description: 'Specific sport: football, hockey, or all',
        required: false,
      },
    ],
  },
  {
    name: 'weather_forecast',
    description: 'Get Swedish weather forecast from Text-TV',
    arguments: [
      {
        name: 'region',
        description: 'Region: national, stockholm, gothenburg, or malmo',
        required: false,
      },
    ],
  },
  {
    name: 'tv_tonight',
    description: "Get tonight's TV schedule for SVT channels",
    arguments: [
      {
        name: 'channel',
        description: 'Channel: svt1, svt2, or both',
        required: false,
      },
    ],
  },
  {
    name: 'texttv_page',
    description: 'Analyze content from a specific Text-TV page',
    arguments: [
      {
        name: 'page',
        description: 'Page number (100-899)',
        required: true,
      },
    ],
  },
];

/**
 * Generate news summary prompt
 */
async function generateNewsSummaryPrompt(focus?: string): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  let pages: number[] = [NEWS_PAGES.MAIN];

  if (focus === 'domestic') {
    pages = [NEWS_PAGES.DOMESTIC_START, NEWS_PAGES.DOMESTIC_START + 1, NEWS_PAGES.DOMESTIC_START + 2];
  } else if (focus === 'foreign') {
    pages = [NEWS_PAGES.FOREIGN_START, NEWS_PAGES.FOREIGN_START + 1, NEWS_PAGES.FOREIGN_START + 2];
  } else if (focus === 'all') {
    pages = [NEWS_PAGES.MAIN, NEWS_PAGES.DOMESTIC_START, NEWS_PAGES.FOREIGN_START];
  }

  const results = await Promise.all(
    pages.map((p) => client.getPage(p, { includePlainText: true }).catch(() => null))
  );

  const content = results
    .filter((r) => r !== null)
    .map((r) => `--- Sida ${r.num} ---\n${r.content_plain ?? r.content}`)
    .join('\n\n');

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Sammanfatta de viktigaste nyheterna från SVT Text-TV. Fokus: ${focus ?? 'huvudnyheter'}.\n\nInnehåll från Text-TV:\n\n${content}`,
        },
      },
    ],
  };
}

/**
 * Generate sports update prompt
 */
async function generateSportsUpdatePrompt(sport?: string): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  let page = SPORTS_PAGES.MAIN;

  if (sport === 'football') {
    page = SPORTS_PAGES.FOOTBALL_START;
  } else if (sport === 'hockey') {
    page = SPORTS_PAGES.HOCKEY_START;
  }

  const result = await client.getPage(page, { includePlainText: true });

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Ge mig en sportuppdatering baserat på SVT Text-TV. Sport: ${sport ?? 'allmänt'}.\n\nInnehåll från sida ${result.num}:\n\n${result.content_plain ?? result.content}`,
        },
      },
    ],
  };
}

/**
 * Generate weather forecast prompt
 */
async function generateWeatherForecastPrompt(region?: string): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  let page = WEATHER_PAGES.NATIONAL;

  if (region === 'stockholm') {
    page = WEATHER_PAGES.STOCKHOLM;
  } else if (region === 'gothenburg') {
    page = WEATHER_PAGES.GOTHENBURG;
  } else if (region === 'malmo') {
    page = WEATHER_PAGES.MALMO;
  }

  const result = await client.getPage(page, { includePlainText: true });

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Ge mig väderprognosen för ${region ?? 'Sverige'} baserat på SVT Text-TV.\n\nInnehåll från sida ${result.num}:\n\n${result.content_plain ?? result.content}`,
        },
      },
    ],
  };
}

/**
 * Generate TV tonight prompt
 */
async function generateTVTonightPrompt(channel?: string): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  const pages: number[] = [];

  if (channel === 'svt1') {
    pages.push(600);
  } else if (channel === 'svt2') {
    pages.push(650);
  } else {
    pages.push(600, 650);
  }

  const results = await Promise.all(
    pages.map((p) => client.getPage(p, { includePlainText: true }).catch(() => null))
  );

  const content = results
    .filter((r) => r !== null)
    .map((r) => `--- Sida ${r.num} ---\n${r.content_plain ?? r.content}`)
    .join('\n\n');

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Vad går det för program på SVT ikväll? Kanal: ${channel ?? 'SVT1 och SVT2'}.\n\nTV-tablå från Text-TV:\n\n${content}`,
        },
      },
    ],
  };
}

/**
 * Generate page analysis prompt
 */
async function generatePageAnalysisPrompt(page: string): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 100 || pageNum > 899) {
    throw new Error('Invalid page number. Must be between 100 and 899.');
  }

  const result = await client.getPage(pageNum, { includePlainText: true });

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analysera innehållet på Text-TV sida ${pageNum}:\n\n${result.content_plain ?? result.content}`,
        },
      },
    ],
  };
}

/**
 * Handle prompt get request
 */
export async function handlePromptGet(
  name: string,
  args: Record<string, string>
): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  switch (name) {
    case 'swedish_news_summary':
      return generateNewsSummaryPrompt(args['focus']);

    case 'sports_update':
      return generateSportsUpdatePrompt(args['sport']);

    case 'weather_forecast':
      return generateWeatherForecastPrompt(args['region']);

    case 'tv_tonight':
      return generateTVTonightPrompt(args['channel']);

    case 'texttv_page':
      if (!args['page']) {
        throw new Error('Page argument is required');
      }
      return generatePageAnalysisPrompt(args['page']);

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
