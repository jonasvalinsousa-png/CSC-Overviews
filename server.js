// server.js
require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Caminho do banco SQLite
const DB_PATH = path.join(__dirname, 'data', 'data.db');
// API Key para proteger a API (definida nas variáveis de ambiente do Render)
const API_KEY = process.env.API_KEY || 'troque-este-segredo';

// Garante que a pasta 'data' exista
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// Inicializa o banco e aplica o schema
const db = new sqlite3.Database(DB_PATH);
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Middleware simples de autenticação: exige cabeçalho x-api-key
function auth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Helpers de validação
function parseIntOrNull(v){ const n = parseInt(v,10); return isNaN(n)? null : n; }
function parseFloatOrNull(v){ const n = parseFloat(v); return isNaN(n)? null : n; }

// POST: recebe e salva um relatório
app.post('/api/relatorios', auth, (req, res) => {
  const b = req.body || {};
  const stmt = db.prepare(`
    INSERT INTO relatorios (
      criado_em, autor, presentes, faltas, inconformidade, avarias,
      planilhamento, expedicao,
      hc_plan, meta_plan, cap_plan,
      hc_inloco, meta_inloco, cap_inloco,
      hc_prev, meta_prev, cap_prev,
      hc_exp, meta_exp, cap_exp,
      rem_inloco, pecas_inloco, rem_plan, pecas_plan, pecas_exp,
      pontos
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  const now = new Date().toISOString();
  stmt.run(
    now,
    b.autor || null,
    parseIntOrNull(b.presentes),
    b.faltas || null,
    parseFloatOrNull(b.inconformidade),
    parseFloatOrNull(b.avarias),
    parseIntOrNull(b.planilhamento),
    parseIntOrNull(b.expedicao),

    parseIntOrNull(b.hcPlan), parseIntOrNull(b.metaPlan), parseIntOrNull(b.capPlan),
    parseIntOrNull(b.hcInLoco), parseIntOrNull(b.metaInLoco), parseIntOrNull(b.capInLoco),
    parseIntOrNull(b.hcPrev), parseIntOrNull(b.metaPrev), parseIntOrNull(b.capPrev),
    parseIntOrNull(b.hcExp), parseIntOrNull(b.metaExp), parseIntOrNull(b.capExp),

    parseIntOrNull(b.remInLoco), parseIntOrNull(b.pecasInLoco),
    parseIntOrNull(b.remPlan), parseIntOrNull(b.pecasPlan),
    parseIntOrNull(b.pecasExp),

    b.pontos || null,
    function(err){
      if (err) return res.status(500).json({ error: 'Erro ao salvar' });
      res.json({ ok:true, id: this.lastID, criado_em: now });
    }
  );
});

// GET: lista relatórios (filtros opcionais ?from=YYYY-MM-DD&to=YYYY-MM-DD)
app.get('/api/relatorios', auth, (req, res) => {
  const { from, to } = req.query;
  let sql = 'SELECT * FROM relatorios';
  const params = [];
  if (from || to) {
    sql += ' WHERE 1=1';
    if (from) { sql += ' AND date(criado_em) >= date(?)'; params.push(from); }
    if (to)   { sql += ' AND date(criado_em) <= date(?)'; params.push(to); }
  }
  sql += ' ORDER BY criado_em DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao consultar' });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API rodando na porta', PORT));
