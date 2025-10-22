import dotenv from "dotenv";
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from "pg";

const pgClient = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASS,
  port: parseInt(process.env.PG_PORT || "5432", 10),
});

console.error("Attempting to connect to PostgreSQL...");
try {
  await pgClient.connect();
  console.error("✅ PostgreSQL connected successfully!");
} catch (error) {
  console.error("❌ Error connecting to PostgreSQL:", error);
  process.exit(1);
}

const server = new Server(
  {
    name: "Servidor MCP PostgreSQL Node.js",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "contar_clientes",
        description: "Conta o número de clientes na tabela 'users'",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`🔵 Tool '${request.params.name}' called`);

  if (request.params.name === "contar_clientes") {
    try {
      console.error("Executing PostgreSQL query...");
      const res = await pgClient.query("SELECT COUNT(*) FROM users");
      const clientCount = parseInt(res.rows[0].count, 10);
      console.error(`✅ Found ${clientCount} clients`);

      return {
        content: [
          {
            type: "text",
            text: `Total de clientes: ${clientCount}`,
          },
        ],
      };
    } catch (error) {
      console.error("❌ Error executing query:", error);
      return {
        content: [
          {
            type: "text",
            text: `Erro ao consultar banco de dados: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ Servidor MCP conectado e pronto!");

process.on("SIGINT", async () => {
  console.error("Shutting down...");
  await pgClient.end();
  process.exit(0);
});
