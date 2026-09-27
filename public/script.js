// script.js
// Consome a API do backend (Express + SQLite) para gerenciar as tarefas.

const form = document.getElementById('form-tarefa');
const input = document.getElementById('input-titulo');
const lista = document.getElementById('lista-tarefas');
const statusEl = document.getElementById('status');

async function carregarTarefas() {
  statusEl.textContent = 'Carregando...';
  try {
    const resp = await fetch('/api/tarefas');
    const tarefas = await resp.json();
    renderizar(tarefas);
    statusEl.textContent = '';
  } catch (err) {
    statusEl.textContent = 'Erro ao carregar tarefas. O backend esta rodando?';
  }
}

function renderizar(tarefas) {
  lista.innerHTML = '';
  if (tarefas.length === 0) {
    lista.innerHTML = '<p style="color:#6b7280;text-align:center;">Nenhuma tarefa ainda.</p>';
    return;
  }
  for (const tarefa of tarefas) {
    const li = document.createElement('li');
    li.className = 'tarefa' + (tarefa.concluida ? ' concluida' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!tarefa.concluida;
    checkbox.addEventListener('change', () => alternarTarefa(tarefa.id));

    const span = document.createElement('span');
    span.className = 'titulo';
    span.textContent = tarefa.titulo;

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'excluir';
    btnExcluir.textContent = '✕';
    btnExcluir.addEventListener('click', () => excluirTarefa(tarefa.id));

    li.append(checkbox, span, btnExcluir);
    lista.appendChild(li);
  }
}

async function criarTarefa(titulo) {
  const resp = await fetch('/api/tarefas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo })
  });
  if (!resp.ok) throw new Error('Falha ao criar tarefa');
}

async function alternarTarefa(id) {
  await fetch(`/api/tarefas/${id}`, { method: 'PATCH' });
  carregarTarefas();
}

async function excluirTarefa(id) {
  await fetch(`/api/tarefas/${id}`, { method: 'DELETE' });
  carregarTarefas();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = input.value.trim();
  if (!titulo) return;
  input.value = '';
  try {
    await criarTarefa(titulo);
    carregarTarefas();
  } catch (err) {
    statusEl.textContent = 'Erro ao adicionar tarefa.';
  }
});

carregarTarefas();
