/**
 * Basic tool tests for SVT Text-TV MCP Server
 */

import { describe, it, expect } from 'vitest';
import { getPage } from '../src/tools/get-page.js';
import { getNews } from '../src/tools/get-news.js';
import { getSports } from '../src/tools/get-sports.js';
import { getWeather } from '../src/tools/get-weather.js';
import { getTVSchedule } from '../src/tools/get-tv-schedule.js';
import { search } from '../src/tools/search.js';
import { browseCategory } from '../src/tools/browse-category.js';
import { validateInput, getPageInputSchema } from '../src/schemas/index.js';

describe('Schema Validation', () => {
  it('validates page number schema', () => {
    expect(() => validateInput(getPageInputSchema, { page: 100 })).not.toThrow();
    expect(() => validateInput(getPageInputSchema, { page: 899 })).not.toThrow();
    expect(() => validateInput(getPageInputSchema, { page: 99 })).toThrow();
    expect(() => validateInput(getPageInputSchema, { page: 900 })).toThrow();
  });

  it('validates includePlainText option', () => {
    const result = validateInput(getPageInputSchema, { page: 100, includePlainText: true });
    expect(result.includePlainText).toBe(true);
  });
});

describe('getPage', () => {
  it('fetches page 100 successfully', async () => {
    const result = await getPage({ page: 100 });

    expect(result).toHaveProperty('page', 100);
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('updatedAt');
    expect(result).toHaveProperty('updatedUnix');
    expect(typeof result.content).toBe('string');
    expect(result.content.length).toBeGreaterThan(0);
  }, 10000);

  it('returns plain text when requested', async () => {
    const result = await getPage({ page: 100, includePlainText: true });

    expect(result).toHaveProperty('contentPlain');
    expect(typeof result.contentPlain).toBe('string');
  }, 10000);

  it('throws for invalid page number', async () => {
    await expect(getPage({ page: 99 })).rejects.toThrow();
    await expect(getPage({ page: 900 })).rejects.toThrow();
  });
});

describe('getNews', () => {
  it('fetches main news successfully', async () => {
    const result = await getNews({ category: 'main' });

    expect(result).toHaveProperty('category', 'main');
    expect(result).toHaveProperty('pages');
    expect(Array.isArray(result.pages)).toBe(true);
    expect(result.pages.length).toBeGreaterThan(0);
  }, 10000);

  it('fetches domestic news', async () => {
    const result = await getNews({ category: 'domestic' });

    expect(result).toHaveProperty('category', 'domestic');
    expect(result.categoryLabel).toBe('Inrikes');
  }, 15000);
});

describe('getSports', () => {
  it('fetches main sports page', async () => {
    const result = await getSports({ category: 'main' });

    expect(result).toHaveProperty('category', 'main');
    expect(result).toHaveProperty('pages');
  }, 10000);
});

describe('getWeather', () => {
  it('fetches national weather', async () => {
    const result = await getWeather({ region: 'national' });

    expect(result).toHaveProperty('region', 'national');
    expect(result).toHaveProperty('page', 400);
    expect(result).toHaveProperty('content');
  }, 10000);
});

describe('getTVSchedule', () => {
  it('fetches SVT1 schedule', async () => {
    const result = await getTVSchedule({ channel: 'svt1' });

    expect(result).toHaveProperty('channel', 'svt1');
    expect(result).toHaveProperty('pages');
  }, 15000);
});

describe('search', () => {
  it('searches for content', async () => {
    const result = await search({ query: 'Sverige', maxResults: 5 });

    expect(result).toHaveProperty('query', 'Sverige');
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  }, 20000);
});

describe('browseCategory', () => {
  it('browses news category', async () => {
    const result = await browseCategory({ category: 'news', limit: 5 });

    expect(result).toHaveProperty('category', 'news');
    expect(result).toHaveProperty('pages');
    expect(result.pages.length).toBeLessThanOrEqual(5);
  }, 15000);
});
