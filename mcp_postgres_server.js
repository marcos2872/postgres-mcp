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
    version: "2.0.0",
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
      // USERS
      {
        name: "listar_usuarios",
        description:
          "Lista usuários com filtros opcionais (role, status, estado, CNPJ)",
        inputSchema: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Filtrar por papel (ADMIN, SENAI_NATIONAL, etc)",
            },
            status: {
              type: "string",
              description: "Filtrar por status (ACTIVE, INACTIVE, BLOCKED)",
            },
            state: { type: "string", description: "Filtrar por estado" },
            cnpj: { type: "string", description: "Filtrar por CNPJ" },
            limit: {
              type: "number",
              description: "Limite de resultados (padrão: 50)",
            },
          },
        },
      },
      {
        name: "buscar_usuario",
        description: "Busca um usuário específico por ID ou email",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID do usuário" },
            email: { type: "string", description: "Email do usuário" },
          },
        },
      },
      {
        name: "contar_usuarios",
        description: "Conta usuários agrupados por role ou status",
        inputSchema: {
          type: "object",
          properties: {
            agrupar_por: {
              type: "string",
              enum: ["role", "status", "state"],
              description: "Campo para agrupar",
            },
          },
        },
      },

      // REQUESTS
      {
        name: "listar_solicitacoes",
        description:
          "Lista solicitações com filtros (status, usuário, escola, empresa)",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description:
                "Filtrar por status (OPEN, ANALYZE, RESPONDED, CANCELED)",
            },
            user_id: {
              type: "string",
              description: "Filtrar por ID do usuário",
            },
            school_cnpj: {
              type: "string",
              description: "Filtrar por CNPJ da escola",
            },
            enterprise_cnpj: {
              type: "string",
              description: "Filtrar por CNPJ da empresa",
            },
            limit: {
              type: "number",
              description: "Limite de resultados (padrão: 50)",
            },
          },
        },
      },
      {
        name: "buscar_solicitacao",
        description:
          "Busca uma solicitação específica por ID com todos os detalhes",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID da solicitação",
              required: true,
            },
          },
          required: ["id"],
        },
      },
      {
        name: "estatisticas_solicitacoes",
        description:
          "Retorna estatísticas sobre solicitações (por status, por período, etc)",
        inputSchema: {
          type: "object",
          properties: {
            periodo_dias: {
              type: "number",
              description: "Últimos N dias (padrão: 30)",
            },
          },
        },
      },

      // SCHOOLS
      {
        name: "listar_escolas",
        description: "Lista escolas/unidades SENAI com filtros",
        inputSchema: {
          type: "object",
          properties: {
            estado: { type: "string", description: "Filtrar por estado" },
            cidade: { type: "string", description: "Filtrar por cidade" },
            cnpj: { type: "string", description: "Filtrar por CNPJ" },
            limite: {
              type: "number",
              description: "Limite de resultados (padrão: 50)",
            },
          },
        },
      },
      {
        name: "buscar_escola_proxima",
        description:
          "Busca escolas próximas a uma localização (latitude/longitude)",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude",
              required: true,
            },
            longitude: {
              type: "number",
              description: "Longitude",
              required: true,
            },
            raio_km: { type: "number", description: "Raio em km (padrão: 50)" },
          },
          required: ["latitude", "longitude"],
        },
      },

      // ENTERPRISES
      {
        name: "listar_empresas",
        description: "Lista empresas com filtros",
        inputSchema: {
          type: "object",
          properties: {
            estado: {
              type: "string",
              description: "Filtrar por unidade federativa",
            },
            municipio: { type: "string", description: "Filtrar por município" },
            cnpj: { type: "string", description: "Filtrar por CNPJ" },
            porte: {
              type: "string",
              description: "Filtrar por porte da empresa",
            },
            limite: {
              type: "number",
              description: "Limite de resultados (padrão: 50)",
            },
          },
        },
      },
      {
        name: "buscar_empresa",
        description: "Busca uma empresa específica por CNPJ",
        inputSchema: {
          type: "object",
          properties: {
            cnpj: {
              type: "string",
              description: "CNPJ da empresa",
              required: true,
            },
          },
          required: ["cnpj"],
        },
      },

      // QUOTAS
      {
        name: "buscar_cota",
        description: "Busca a cota de aprendizes para uma empresa por CNPJ",
        inputSchema: {
          type: "object",
          properties: {
            cnpj: {
              type: "string",
              description: "CNPJ da empresa",
              required: true,
            },
          },
          required: ["cnpj"],
        },
      },
      {
        name: "listar_cotas",
        description: "Lista cotas de empresas",
        inputSchema: {
          type: "object",
          properties: {
            limite: {
              type: "number",
              description: "Limite de resultados (padrão: 50)",
            },
          },
        },
      },

      // COURSES
      {
        name: "listar_cursos_solicitacao",
        description: "Lista cursos de uma solicitação específica",
        inputSchema: {
          type: "object",
          properties: {
            request_id: {
              type: "string",
              description: "ID da solicitação",
              required: true,
            },
          },
          required: ["request_id"],
        },
      },

      // ITINERARIES
      {
        name: "buscar_itinerarios",
        description: "Busca itinerários formativos por código do curso ou nome",
        inputSchema: {
          type: "object",
          properties: {
            codigo_curso: {
              type: "string",
              description: "Código do curso MTE",
            },
            nome_curso: {
              type: "string",
              description: "Nome do curso (busca parcial)",
            },
            limite: {
              type: "number",
              description: "Limite de resultados (padrão: 50)",
            },
          },
        },
      },

      // LOGS
      {
        name: "listar_logs_usuario",
        description: "Lista logs de ações de um usuário específico",
        inputSchema: {
          type: "object",
          properties: {
            user_id: {
              type: "string",
              description: "ID do usuário",
              required: true,
            },
            action: {
              type: "string",
              description: "Filtrar por ação específica",
            },
            limite: {
              type: "number",
              description: "Limite de resultados (padrão: 100)",
            },
          },
          required: ["user_id"],
        },
      },

      // GENERIC QUERY
      {
        name: "executar_query_customizada",
        description: "Executa uma query SQL customizada (apenas SELECT)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Query SQL (apenas SELECT)",
              required: true,
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`🔵 Tool '${request.params.name}' called`);
  const args = request.params.arguments || {};

  try {
    switch (request.params.name) {
      // ===== USERS =====
      case "listar_usuarios": {
        let query =
          "SELECT id, name, email, phone, role, status, cnpj, state, created_at FROM users WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (args.role) {
          query += ` AND role = $${paramCount++}`;
          params.push(args.role);
        }
        if (args.status) {
          query += ` AND status = $${paramCount++}`;
          params.push(args.status);
        }
        if (args.state) {
          query += ` AND state = $${paramCount++}`;
          params.push(args.state);
        }
        if (args.cnpj) {
          query += ` AND cnpj = $${paramCount++}`;
          params.push(args.cnpj);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        params.push(args.limit || 50);

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      case "buscar_usuario": {
        let query = "SELECT * FROM users WHERE ";
        const params = [];

        if (args.id) {
          query += "id = $1";
          params.push(args.id);
        } else if (args.email) {
          query += "email = $1";
          params.push(args.email);
        } else {
          throw new Error("É necessário informar id ou email");
        }

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text:
                res.rows.length > 0
                  ? JSON.stringify(res.rows[0], null, 2)
                  : "Usuário não encontrado",
            },
          ],
        };
      }

      case "contar_usuarios": {
        const groupBy = args.agrupar_por || "role";
        const query = `SELECT ${groupBy}, COUNT(*) as total FROM users GROUP BY ${groupBy} ORDER BY total DESC`;
        const res = await pgClient.query(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      // ===== REQUESTS =====
      case "listar_solicitacoes": {
        let query = `SELECT id, school_name, enterprise_name, status, total_vacancies,
                     user_id, finished_at, created_at FROM requests WHERE 1=1`;
        const params = [];
        let paramCount = 1;

        if (args.status) {
          query += ` AND status = $${paramCount++}`;
          params.push(args.status);
        }
        if (args.user_id) {
          query += ` AND user_id = $${paramCount++}`;
          params.push(args.user_id);
        }
        if (args.school_cnpj) {
          query += ` AND school_cnpj = $${paramCount++}`;
          params.push(args.school_cnpj);
        }
        if (args.enterprise_cnpj) {
          query += ` AND enterprise_cnpj = $${paramCount++}`;
          params.push(args.enterprise_cnpj);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        params.push(args.limit || 50);

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      case "buscar_solicitacao": {
        const query = "SELECT * FROM requests WHERE id = $1";
        const res = await pgClient.query(query, [args.id]);

        if (res.rows.length === 0) {
          return {
            content: [{ type: "text", text: "Solicitação não encontrada" }],
          };
        }

        // Buscar cursos relacionados
        const coursesQuery =
          "SELECT * FROM request_courses WHERE request_id = $1";
        const courses = await pgClient.query(coursesQuery, [args.id]);

        const result = {
          ...res.rows[0],
          courses: courses.rows,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "estatisticas_solicitacoes": {
        const dias = args.periodo_dias || 30;
        const queries = [
          `SELECT status, COUNT(*) as total FROM requests
           WHERE created_at >= NOW() - INTERVAL '${dias} days'
           GROUP BY status`,
          `SELECT COUNT(*) as total_periodo FROM requests
           WHERE created_at >= NOW() - INTERVAL '${dias} days'`,
          `SELECT SUM(total_vacancies) as total_vagas FROM requests
           WHERE created_at >= NOW() - INTERVAL '${dias} days'`,
        ];

        const results = await Promise.all(
          queries.map((q) => pgClient.query(q)),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  por_status: results[0].rows,
                  total_solicitacoes: results[1].rows[0].total_periodo,
                  total_vagas: results[2].rows[0].total_vagas || 0,
                  periodo_dias: dias,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // ===== SCHOOLS =====
      case "listar_escolas": {
        let query = "SELECT * FROM schools WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (args.estado) {
          query += ` AND estado = $${paramCount++}`;
          params.push(args.estado);
        }
        if (args.cidade) {
          query += ` AND cidade ILIKE $${paramCount++}`;
          params.push(`%${args.cidade}%`);
        }
        if (args.cnpj) {
          query += ` AND cnpj_unidade = $${paramCount++}`;
          params.push(args.cnpj);
        }

        query += ` LIMIT $${paramCount}`;
        params.push(args.limite || 50);

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      case "buscar_escola_proxima": {
        const raio = args.raio_km || 50;
        const query = `
          SELECT *,
            (6371 * acos(cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) + sin(radians($1)) *
            sin(radians(latitude)))) AS distancia_km
          FROM schools
          WHERE (6371 * acos(cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) + sin(radians($1)) *
            sin(radians(latitude)))) <= $3
          ORDER BY distancia_km
          LIMIT 20
        `;
        const res = await pgClient.query(query, [
          args.latitude,
          args.longitude,
          raio,
        ]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      // ===== ENTERPRISES =====
      case "listar_empresas": {
        let query = "SELECT * FROM enterprises WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (args.estado) {
          query += ` AND unidade_federativa = $${paramCount++}`;
          params.push(args.estado);
        }
        if (args.municipio) {
          query += ` AND municipio ILIKE $${paramCount++}`;
          params.push(`%${args.municipio}%`);
        }
        if (args.cnpj) {
          query += ` AND cnpj = $${paramCount++}`;
          params.push(args.cnpj);
        }
        if (args.porte) {
          query += ` AND porte_da_empresa = $${paramCount++}`;
          params.push(args.porte);
        }

        query += ` LIMIT $${paramCount}`;
        params.push(args.limite || 50);

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      case "buscar_empresa": {
        const query = "SELECT * FROM enterprises WHERE cnpj = $1";
        const res = await pgClient.query(query, [args.cnpj]);
        return {
          content: [
            {
              type: "text",
              text:
                res.rows.length > 0
                  ? JSON.stringify(res.rows[0], null, 2)
                  : "Empresa não encontrada",
            },
          ],
        };
      }

      // ===== QUOTAS =====
      case "buscar_cota": {
        const query = "SELECT * FROM quotas WHERE cnpj = $1";
        const res = await pgClient.query(query, [args.cnpj]);
        return {
          content: [
            {
              type: "text",
              text:
                res.rows.length > 0
                  ? JSON.stringify(res.rows[0], null, 2)
                  : "Cota não encontrada",
            },
          ],
        };
      }

      case "listar_cotas": {
        const query = "SELECT * FROM quotas ORDER BY created_at DESC LIMIT $1";
        const res = await pgClient.query(query, [args.limite || 50]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      // ===== COURSES =====
      case "listar_cursos_solicitacao": {
        const query = "SELECT * FROM request_courses WHERE request_id = $1";
        const res = await pgClient.query(query, [args.request_id]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      // ===== ITINERARIES =====
      case "buscar_itinerarios": {
        let query = "SELECT * FROM itinerary WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (args.codigo_curso) {
          query += ` AND codigo_do_curso_mte = $${paramCount++}`;
          params.push(args.codigo_curso);
        }
        if (args.nome_curso) {
          query += ` AND nome_curso_itinerario ILIKE $${paramCount++}`;
          params.push(`%${args.nome_curso}%`);
        }

        query += ` LIMIT $${paramCount}`;
        params.push(args.limite || 50);

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      // ===== LOGS =====
      case "listar_logs_usuario": {
        let query = "SELECT * FROM user_logs WHERE user_id = $1";
        const params = [args.user_id];
        let paramCount = 2;

        if (args.action) {
          query += ` AND action = $${paramCount++}`;
          params.push(args.action);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        params.push(args.limite || 100);

        const res = await pgClient.query(query, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      // ===== CUSTOM QUERY =====
      case "executar_query_customizada": {
        // Segurança: apenas SELECT
        if (!args.query.trim().toUpperCase().startsWith("SELECT")) {
          throw new Error("Apenas queries SELECT são permitidas");
        }

        const res = await pgClient.query(args.query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.rows, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
    }
  } catch (error) {
    console.error("❌ Error executing tool:", error);
    return {
      content: [
        {
          type: "text",
          text: `Erro ao executar ferramenta: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ Servidor MCP conectado e pronto!");

process.on("SIGINT", async () => {
  console.error("Shutting down...");
  await pgClient.end();
  process.exit(0);
});
