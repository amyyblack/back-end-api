import pkg from "pg";
import dotenv from "dotenv";
import express from "express"; // Requisição do pacote do express

const app = express(); // Instancia o Express
const port = 3000; // Define a porta

dotenv.config();
const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL

let pool = null; // Variável para armazenar o pool de conexões com o banco de dados

// Função para conectar ao banco de dados
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

  const db = conectarBD(); // Atribui o retorno da função conectarBD()

  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa a consulta SQL
    const dados = resultado.rows; // Obtém as linhas retornadas
    res.json(dados); // Retorna como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

app.get("/", async (req, res) => { // Cria endpoint na rota da raiz do projeto
  console.log("Rota GET / solicitada");

  const db = conectarBD(); // Atribui o retorno da função conectarBD()

  let dbStatus = "ok";
  try {
    console.log("Conexão com o banco de dados bem sucedida.");
    await db.query("SELECT 1"); // Verifica se a conexão está funcionando
  } catch (e) {
    dbStatus = e.message;
  }

  res.json({
    message: "API da Amanda", // Substitua pelo conteúdo da sua API
    author: "Amanda Rodrigues de Sousa", // Substitua pelo seu nome
    statusBD: dbStatus,
  });
});

app.listen(port, () => { // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta: ${port}`);
});