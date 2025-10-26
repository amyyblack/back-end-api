import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();         // Carrega e processa o arquivo .env
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta
const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL
let pool = null; // Variável para armazenar o pool de conexões com o banco de dados
app.use(express.json());
// Função para obter uma conexão com o banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada
  
  const db = new Pool({
    // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados
    connectionString: process.env.URL_BD, // Usa a variável de ambiente do arquivo .env DATABASE_URL para a string de conexão
  });
  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

app.get("/", async (req, res) => {        // Cria endpoint na rota da raiz do projeto
  const db = new Pool({
    connectionString: process.env.URL_BD,
  });

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }
  console.log("Rota GET / solicitada");
  res.json({
    message: "API da Amanda", // Substitua pelo conteúdo da sua API
    author: "Amanda Rodrigues de Sousa", // Substitua pelo seu nome
    statusBD: dbStatus,
  });
});

//server.js
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const data = req.body; // Obtém os dados do corpo da requisição
    // Validação dos dados recebidos
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD(); // Conecta ao banco de dados

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4) "; // Consulta SQL para inserir a questão
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel]; // Array com os valores a serem inseridos
    const resultado = await db.query(consulta, questao); // Executa a consulta SQL com os valores fornecidos
    res.status(201).json({ mensagem: "Questão criada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao inserir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let questao = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    const data = req.body; // Obtém os dados do corpo da requisição

    // Usa o valor enviado ou mantém o valor atual do banco
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão
    consulta ="UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    // Executa a consulta SQL com os valores fornecidos
    resultado = await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao atualizar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// ===================== ROTAS DE FILMES =====================

// GET /filmes → lista todos os filmes
app.get("/filmes", async (req, res) => {
  console.log("Rota GET /filmes solicitada");
  try {
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM filmes ORDER BY id_filme");
    res.status(200).json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar filmes:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// GET /filmes/:id → busca um filme específico
app.get("/filmes/:id", async (req, res) => {
  console.log("Rota GET /filmes/:id solicitada");
  try {
    const id = req.params.id;
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM filmes WHERE id_filme = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Filme não encontrado" });
    }
    res.status(200).json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar filme:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// POST /filmes → adiciona um novo filme
app.post("/filmes", async (req, res) => {
  console.log("Rota POST /filmes solicitada");
  try {
    const data = req.body;

    // Validação simples dos campos obrigatórios
    if (!data.titulo || !data.ano_lancamento || !data.diretor) {
      return res.status(400).json({
        erro: "Campos obrigatórios ausentes",
        mensagem: "Informe título, ano_lancamento e diretor."
      });
    }

    const db = conectarBD();
    const consulta = `
      INSERT INTO filmes (titulo, descricao, ano_lancamento, duracao_min, diretor, avaliacao_media, poster_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_filme;
    `;
    const valores = [
      data.titulo,
      data.descricao || null,
      data.ano_lancamento,
      data.duracao_min || null,
      data.diretor,
      data.avaliacao_media || 0,
      data.poster_url || null,
    ];

    const resultado = await db.query(consulta, valores);
    res.status(201).json({
      mensagem: "Filme cadastrado com sucesso!",
      id_filme: resultado.rows[0].id_filme,
    });
  } catch (e) {
    console.error("Erro ao inserir filme:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// PUT /filmes/:id → atualiza dados de um filme
app.put("/filmes/:id", async (req, res) => {
  console.log("Rota PUT /filmes/:id solicitada");
  try {
    const id = req.params.id;
    const data = req.body;
    const db = conectarBD();

    // Busca o filme existente
    const busca = await db.query("SELECT * FROM filmes WHERE id_filme = $1", [id]);
    if (busca.rows.length === 0) {
      return res.status(404).json({ mensagem: "Filme não encontrado" });
    }

    const filmeAtual = busca.rows[0];

    // Atualiza apenas os campos informados
    const consulta = `
      UPDATE filmes
      SET titulo = $1, descricao = $2, ano_lancamento = $3, duracao_min = $4, 
          diretor = $5, avaliacao_media = $6, poster_url = $7
      WHERE id_filme = $8
    `;
    const valores = [
      data.titulo || filmeAtual.titulo,
      data.descricao || filmeAtual.descricao,
      data.ano_lancamento || filmeAtual.ano_lancamento,
      data.duracao_min || filmeAtual.duracao_min,
      data.diretor || filmeAtual.diretor,
      data.avaliacao_media ?? filmeAtual.avaliacao_media,
      data.poster_url || filmeAtual.poster_url,
      id
    ];

    await db.query(consulta, valores);
    res.status(200).json({ mensagem: "Filme atualizado com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar filme:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// DELETE /filmes/:id → remove um filme
app.delete("/filmes/:id", async (req, res) => {
  console.log("Rota DELETE /filmes/:id solicitada");
  try {
    const id = req.params.id;
    const db = conectarBD();

    const busca = await db.query("SELECT * FROM filmes WHERE id_filme = $1", [id]);
    if (busca.rows.length === 0) {
      return res.status(404).json({ mensagem: "Filme não encontrado" });
    }

    await db.query("DELETE FROM filmes WHERE id_filme = $1", [id]);
    res.status(200).json({ mensagem: "Filme excluído com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir filme:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});


app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});