import { createMcpHandler } from "@vercel/mcp-adapter";
import createMcpServer, { SOCRATA_TOOLS } from "opengov-mcp-server";

// 1) Make sure DATA_PORTAL_URL is set in your Vercel env
const portal = process.env.DATA_PORTAL_URL;
if (!portal) {
  throw new Error("DATA_PORTAL_URL environment variable is required");
}

export const handler = createMcpHandler(
  // 2) Wire up the Socrata tools
  (server) => {
    createMcpServer(server, { portal });
  },
  // 3) Publish tool metadata for clients
  {
    capabilities: {
      tools: SOCRATA_TOOLS.reduce<Record<string, { description: string }>>(
        (acc, tool) => {
          acc[tool.name] = { description: tool.description };
          return acc;
        },
        {}
      ),
    },
  },
  // 4) Adapter options
  {
    redisUrl: process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL!,
    sseEndpoint: "/sse",
    streamableHttpEndpoint: "/mcp",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
