import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// conexão PostgreSQL
const pool = new Pool({
  user: "postgres",     // altere se necessário
  host: "localhost",
  database: "TesteIA", // nome do banco
  password: "Gustavo@1902",   // coloque a senha do seu PostgreSQL
  port: 5432
});

// função resposta padrão
function respostaIA(intencao, dados, mensagemPadrao) {
  return { intencao, dados, mensagemPadrao };
}

// rota chatbot
app.post("/chatbot", async (req, res) => {
  const { pergunta } = req.body;
  if (!pergunta) {
    return res.json(respostaIA("ERRO", {}, "Pergunta não informada."));
  }

  let lower = pergunta.toLowerCase();
  let resposta = respostaIA("DESCONHECIDA", {}, "Não entendi a pergunta.");

  try {
    if (lower.includes("marcas")) {
      const result = await pool.query("SELECT * FROM marca");
      resposta = respostaIA("LISTAR_MARCAS", result.rows, "Essas são as marcas cadastradas:");
    }

    else if (lower.includes("modelos")) {
      const result = await pool.query("SELECT * FROM modelo");
      resposta = respostaIA("LISTAR_MODELOS", result.rows, "Esses são os modelos cadastrados:");
    }

    else if (lower.includes("cores")) {
      const result = await pool.query("SELECT * FROM cor");
      resposta = respostaIA("LISTAR_CORES", result.rows, "Essas são as cores disponíveis:");
    }

    else if (lower.includes("carros pret")) {
      const result = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM veiculo v
        JOIN cor c ON v.cor_id = c.id
        WHERE c.nome ILIKE 'preto' AND v.disponivel = true
      `);
      resposta = respostaIA("LISTAR_VEICULOS", { count: result.rows[0].count }, "Existem {count} carros pretos disponíveis.");
    }

    else if (lower.includes("carros dispon")) {
      const result = await pool.query(`
        SELECT v.id, m.nome AS modelo, c.nome AS cor, v.preco, v.quilometragem
        FROM veiculo v
        JOIN modelo m ON v.modelo_id = m.id
        JOIN cor c ON v.cor_id = c.id
        WHERE v.disponivel = true
      `);
      resposta = respostaIA("LISTAR_VEICULOS", result.rows, "Esses são os veículos disponíveis:");
    }

  } catch (err) {
    console.error(err);
    resposta = respostaIA("ERRO", {}, "Erro ao consultar o banco.");
  }

  res.json(resposta);
});

app.listen(8080, () => console.log("🚀 Servidor rodando em http://localhost:8080"));
