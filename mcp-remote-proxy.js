// mcp-remote-proxy.js
import http from "http";
import httpProxy from "http-proxy";
const proxy = httpProxy.createProxyServer({});

// URL DO SEU SERVIDOR REMOTO
const REMOTE_MCP_URL = "http://localhost:3001"; // ← SUBSTITUA PELA SUA URL

// Servidor proxy local na porta 3001
const server = http.createServer((req, res) => {
  // Redireciona TODAS as requests para o servidor remoto
  proxy.web(req, res, { target: REMOTE_MCP_URL });
});

// Log para debug
proxy.on("proxyReq", (proxyReq, req) => {
  console.log(`📡 Proxy: ${req.method} ${req.url} → ${REMOTE_MCP_URL}`);
});

server.listen(3002, () => {
  console.log("🔗 Proxy MCP rodando em http://localhost:3002/api/mcp");
  console.log(`   → Conectado ao servidor remoto: ${REMOTE_MCP_URL}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Proxy encerrado.");
    process.exit(0);
  });
});
