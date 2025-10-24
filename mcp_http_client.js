import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function runClient() {
  // 2. Substitua 'StdioClientTransport' por 'HttpClientTransport'
  const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3001/api/mcp"), // <-- COLOQUE SUA URL AQUI
  );

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
    // A partir daqui, o código para interagir com o cliente não muda
    await client.connect(transport);
    console.log("✅ Cliente MCP conectado ao servidor!");

    const tools = await client.listTools();
    console.log("Ferramentas disponíveis:", tools);

    const result = await client.callTool({
      name: "listSchools",
      arguments: {
        state: "SP",
      },
    });

    console.log("Resultado da ferramenta 'listar_escolas':", result);
  } catch (error) {
    console.error("Erro ao chamar a ferramenta:", error);
  } finally {
    await client.close();
    console.log("Cliente MCP desconectado.");
  }
}

runClient();
