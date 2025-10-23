import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function runClient() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["mcp_postgres_server.js"],
  });

  const client = new Client(
    {
      name: "MCP Client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  try {
    await client.connect(transport);
    console.log("✅ Cliente MCP conectado ao servidor!");

    const tools = await client.listTools();
    console.log("Ferramentas disponíveis:", tools);

    const result = await client.callTool({
      name: "listar_escolas",
      arguments: {},
    });

    console.log("Resultado da ferramenta 'listar_usuarios':", result);
  } catch (error) {
    console.error("Erro ao chamar a ferramenta:", error);
  } finally {
    await client.close();
    console.log("Cliente MCP desconectado.");
    process.exit(0);
  }
}

runClient();
