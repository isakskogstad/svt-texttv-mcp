# SVT Text-TV MCP Server

## Overview
MCP server for SVT Text-TV - Exposes Swedish teletext content (news, sports, weather, TV schedules) through the Model Context Protocol.

## Tech Stack
- TypeScript 5.7
- MCP SDK 1.0
- Express (HTTP server)
- Zod (validation)
- texttv-api (underlying API client)

## Project Structure
```
src/
├── index.ts              # Stdio entry point
├── http-server.ts        # HTTP server (/, /health, /mcp)
├── server.ts             # Shared MCP server logic
├── schemas/              # Zod validation schemas
├── tools/                # MCP tool implementations
├── resources/            # MCP resource definitions
├── prompts/              # MCP prompt templates
├── cache/                # In-memory cache
└── config/               # Constants and config
```

## Instructions
- Uses texttv-api as npm dependency
- No auth required (public API)
- Dual transport: stdio + HTTP/SSE
- Short TTL caching (15-30s)

## Settings
- Build: `npm run build`
- Test: `npm test`
- Dev: `npm run dev`
- HTTP Dev: `npm run dev:http`

## Backup Info
- Last session backup: 2025-12-02
- Backup retention: Standard

## Notes
- Based on texttv-api library in sibling folder
- Deployed to Render at svt-texttv-mcp.onrender.com
- Published to NPM as svt-texttv-mcp
