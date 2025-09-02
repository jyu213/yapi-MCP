import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YapiMcpServer } from "./server";
import { getServerConfig } from "./config";

export async function startServer(): Promise<void> {
  const config = getServerConfig();

  const server = new YapiMcpServer(config.yapiBaseUrl, config.yapiToken, config.yapiCookie);

  // Check if we're running in stdio mode (e.g., via CLI)
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  if (isStdioMode) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    await server.startHttpServer(config.port);
  }
}

// If this file is being run directly, start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
