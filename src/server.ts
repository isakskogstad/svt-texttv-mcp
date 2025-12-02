/**
 * Shared MCP Server logic for SVT Text-TV
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SERVER_INFO } from './config/index.js';
import { TOOLS, handleToolCall } from './tools/index.js';
import { RESOURCES, handleResourceRead } from './resources/index.js';
import { PROMPTS, handlePromptGet } from './prompts/index.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
  });

  // Register tool handlers
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      })),
    };
  });

  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params as {
      name: string;
      arguments?: Record<string, unknown>;
    };

    try {
      const result = await handleToolCall(name, args ?? {});

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: message }),
          },
        ],
        isError: true,
      };
    }
  });

  // Register resource handlers
  server.setRequestHandler('resources/list', async () => {
    return {
      resources: RESOURCES.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      })),
    };
  });

  server.setRequestHandler('resources/read', async (request) => {
    const { uri } = request.params as { uri: string };

    try {
      const result = await handleResourceRead(uri);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read resource: ${message}`);
    }
  });

  // Register prompt handlers
  server.setRequestHandler('prompts/list', async () => {
    return {
      prompts: PROMPTS.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments,
      })),
    };
  });

  server.setRequestHandler('prompts/get', async (request) => {
    const { name, arguments: args } = request.params as {
      name: string;
      arguments?: Record<string, string>;
    };

    try {
      const result = await handlePromptGet(name, args ?? {});
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get prompt: ${message}`);
    }
  });

  return server;
}

export { SERVER_INFO };
