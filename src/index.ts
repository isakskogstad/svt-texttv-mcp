#!/usr/bin/env node
/**
 * SVT Text-TV MCP Server - Stdio Entry Point
 *
 * Run with:
 *   node dist/index.js
 *   npx svt-texttv-mcp
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer, SERVER_INFO } from './server.js';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  // Log startup to stderr (stdout is for JSON-RPC)
  console.error(`${SERVER_INFO.name} v${SERVER_INFO.version} starting...`);
  console.error(`${SERVER_INFO.description}`);

  await server.connect(transport);

  console.error('Server connected via stdio transport');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down...');
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
