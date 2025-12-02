#!/usr/bin/env node
/**
 * SVT Text-TV MCP Server - HTTP Entry Point
 *
 * Exposes the MCP server via HTTP with SSE transport.
 *
 * Endpoints:
 *   GET  /       - Server info and documentation
 *   GET  /health - Health check endpoint
 *   POST /mcp    - MCP endpoint (JSON-RPC over SSE)
 */

import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer, SERVER_INFO } from './server.js';
import { HTTP_DEFAULTS } from './config/index.js';
import { TOOLS } from './tools/index.js';
import { RESOURCES } from './resources/index.js';
import { PROMPTS } from './prompts/index.js';

const app = express();
app.use(express.json());

// CORS headers for browser access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * GET / - Server info and documentation
 */
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SERVER_INFO.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      background: #0a0a0a;
      color: #e0e0e0;
    }
    h1, h2, h3 { color: #fff; }
    h1 { border-bottom: 2px solid #ffd700; padding-bottom: 0.5rem; }
    code {
      background: #1a1a2e;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre {
      background: #1a1a2e;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    .tool {
      background: #1a1a2e;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
    }
    .tool h3 { margin-top: 0; color: #ffd700; }
    .endpoint {
      display: inline-block;
      background: #2d5016;
      color: #90ee90;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
    }
    a { color: #00bfff; }
    .badge {
      display: inline-block;
      background: #333;
      color: #fff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8em;
      margin-left: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>SVT Text-TV MCP Server</h1>
  <p>${SERVER_INFO.description}</p>
  <p><strong>Version:</strong> ${SERVER_INFO.version}</p>

  <h2>Endpoints</h2>
  <ul>
    <li><span class="endpoint">GET /</span> - This documentation page</li>
    <li><span class="endpoint">GET /health</span> - Health check endpoint</li>
    <li><span class="endpoint">POST /mcp</span> - MCP endpoint (JSON-RPC over SSE)</li>
  </ul>

  <h2>MCP Configuration</h2>
  <p>Add this to your Claude Desktop config:</p>
  <pre><code>{
  "mcpServers": {
    "svt-texttv": {
      "type": "http",
      "url": "${req.protocol}://${req.get('host')}/mcp"
    }
  }
}</code></pre>

  <h2>Available Tools (${TOOLS.length})</h2>
  ${TOOLS.map(
    (tool) => `
  <div class="tool">
    <h3>${tool.name}<span class="badge">read-only</span></h3>
    <p>${tool.description}</p>
  </div>
  `
  ).join('')}

  <h2>Resources (${RESOURCES.length})</h2>
  ${RESOURCES.map(
    (resource) => `
  <div class="tool">
    <h3>${resource.name}</h3>
    <p>${resource.description}</p>
    <code>${resource.uri}</code>
  </div>
  `
  ).join('')}

  <h2>Prompts (${PROMPTS.length})</h2>
  ${PROMPTS.map(
    (prompt) => `
  <div class="tool">
    <h3>${prompt.name}</h3>
    <p>${prompt.description}</p>
  </div>
  `
  ).join('')}

  <h2>Links</h2>
  <ul>
    <li><a href="https://github.com/isakskogstad/svt-texttv-mcp">GitHub Repository</a></li>
    <li><a href="https://texttv.nu">texttv.nu (Data Source)</a></li>
    <li><a href="https://modelcontextprotocol.io">Model Context Protocol</a></li>
  </ul>

  <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #333; color: #888;">
    <p>Made with Claude Code</p>
  </footer>
</body>
</html>
  `;

  res.type('html').send(html);
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: SERVER_INFO.name,
    version: SERVER_INFO.version,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /mcp - MCP endpoint with SSE transport
 */
app.post('/mcp', async (req, res) => {
  try {
    const server = createServer();
    const transport = new SSEServerTransport('/mcp', res);

    await server.connect(transport);

    // Handle the request body as a JSON-RPC message
    if (req.body) {
      await transport.handlePostMessage(req, res, req.body);
    }
  } catch (error) {
    console.error('MCP error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
});

/**
 * Start the server
 */
const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : HTTP_DEFAULTS.PORT;
const HOST = process.env['HOST'] ?? HTTP_DEFAULTS.HOST;

app.listen(PORT, HOST, () => {
  console.log(`${SERVER_INFO.name} v${SERVER_INFO.version}`);
  console.log(`HTTP server listening on http://${HOST}:${PORT}`);
  console.log(`MCP endpoint: http://${HOST}:${PORT}/mcp`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
});
