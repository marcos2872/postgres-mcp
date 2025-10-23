# Servidor MCP com PostgreSQL

Este é um servidor MCP (Model Context Protocol) que se conecta a um banco de dados PostgreSQL para fornecer um conjunto de ferramentas para interagir com os dados.

## Instalação

Para instalar as dependências, execute o seguinte comando:

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente com as informações de conexão do seu banco de dados PostgreSQL.

```bash
cp .env.example .env
```

## Executando o servidor

Para iniciar o servidor, execute o seguinte comando:

```bash
npm start
```

O servidor será iniciado e se conectará ao banco de dados PostgreSQL.

## Ferramentas Disponíveis

O servidor fornece as seguintes ferramentas:

### Usuários

*   `listar_usuarios`: Lista usuários com filtros opcionais (role, status, estado, CNPJ).
*   `buscar_usuario`: Busca um usuário específico por ID ou email.
*   `contar_usuarios`: Conta usuários agrupados por role ou status.

### Solicitações

*   `listar_solicitacoes`: Lista solicitações com filtros (status, usuário, escola, empresa).
*   `buscar_solicitacao`: Busca uma solicitação específica por ID com todos os detalhes.
*   `estatisticas_solicitacoes`: Retorna estatísticas sobre solicitações (por status, por período, etc).

### Escolas

*   `listar_escolas`: Lista escolas/unidades SENAI com filtros.
*   `buscar_escola_proxima`: Busca escolas próximas a uma localização (latitude/longitude).

### Empresas

*   `listar_empresas`: Lista empresas com filtros.
*   `buscar_empresa`: Busca uma empresa específica por CNPJ.

### Cotas

*   `buscar_cota`: Busca a cota de aprendizes para uma empresa por CNPJ.
*   `listar_cotas`: Lista cotas de empresas.

### Cursos

*   `listar_cursos_solicitacao`: Lista cursos de uma solicitação específica.

### Itinerários

*   `buscar_itinerarios`: Busca itinerários formativos por código do curso ou nome.

### Logs

*   `listar_logs_usuario`: Lista logs de ações de um usuário específico.

### Query Customizada

*   `executar_query_customizada`: Executa uma query SQL customizada (apenas SELECT).
