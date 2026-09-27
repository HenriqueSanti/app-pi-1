// server.js
// Backend simples em Express usando SQLite (modulo nativo node:sqlite) como banco de dados.
// Serve tambem o frontend estatico da pasta /public.
// Requer Node.js >= 22.5 (nao precisa instalar nenhum pacote de banco de dados).

const express = require('express');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite'); // módulo nativo do Node (>=22.5), sem compilação/instalação

const PORT = process.env.PORT || 8000;
const DB_PATH = path.join(__dirname, 'data', 'todo.db');

// Garante que a pasta "data" exista
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = new DatabaseSync(DB_PATH);

// Cria a tabela se ainda nao existir
db.exec(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    concluida INTEGER NOT NULL DEFAULT 0,
    criada_em TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/tarefas -> lista todas as tarefas
app.get('/api/tarefas', (req, res) => {
  const tarefas = db.prepare('SELECT * FROM tarefas ORDER BY id DESC').all();
  res.json(tarefas);
});

// POST /api/tarefas -> cria uma nova tarefa { titulo }
app.post('/api/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ erro: 'O titulo da tarefa e obrigatorio.' });
  }
  const info = db.prepare('INSERT INTO tarefas (titulo) VALUES (?)').run(titulo.trim());
  const novaTarefa = db.prepare('SELECT * FROM tarefas WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(novaTarefa);
});

// PATCH /api/tarefas/:id -> alterna concluida (true/false)
app.patch('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const tarefa = db.prepare('SELECT * FROM tarefas WHERE id = ?').get(id);
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada.' });

  const novoStatus = tarefa.concluida ? 0 : 1;
  db.prepare('UPDATE tarefas SET concluida = ? WHERE id = ?').run(novoStatus, id);
  const atualizada = db.prepare('SELECT * FROM tarefas WHERE id = ?').get(id);
  res.json(atualizada);
});

// DELETE /api/tarefas/:id -> remove uma tarefa
app.delete('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM tarefas WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ erro: 'Tarefa nao encontrada.' });
  res.status(204).send();
});

// Rota de saude, util para testar o servidor/ngrok rapidamente
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hora: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
