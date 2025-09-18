import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();         // Carrega e processa o arquivo .env
const { Pool } = pkg;    // Utiliza a Classe Pool do Postgres
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta

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
		message: "API da Amanda",      // Substitua pelo conteúdo da sua API
    author: "Amanda Rodrigues de Sousa",    // Substitua pelo seu nome
    statusBD: dbStatus 
  });
});

app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});