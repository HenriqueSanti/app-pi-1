# Todo App — Backend + Frontend + Banco de Dados

App simples de lista de tarefas, feito para testar o fluxo de deploy do seu Ubuntu Server:

- **Backend:** Node.js + Express (`server.js`)
- **Banco de dados:** SQLite, via `better-sqlite3` (arquivo criado automaticamente em `data/todo.db`)
- **Frontend:** HTML/CSS/JS puro, servido estaticamente pelo próprio Express (`/public`)

## Rodando localmente (Ubuntu Server)

```bash
# Dentro de /var/www/apps/todo-app
npm install
npm start
```

O servidor sobe em `http://localhost:8000` (ou na porta definida em `PORT`).
Teste rápido:

```bash
curl http://localhost:8000/api/health
```

## Estrutura

```
todo-app/
├── package.json
├── server.js          # API REST + serve o frontend
├── .gitignore
├── data/               # criado automaticamente (banco SQLite) — ignorado no git
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## Rotas da API

| Método | Rota              | Descrição                         |
|--------|--------------------|-------------------------------------|
| GET    | `/api/tarefas`      | Lista todas as tarefas              |
| POST   | `/api/tarefas`      | Cria tarefa `{ "titulo": "..." }`   |
| PATCH  | `/api/tarefas/:id`  | Alterna concluída/não concluída     |
| DELETE | `/api/tarefas/:id`  | Remove a tarefa                     |
| GET    | `/api/health`       | Verifica se o servidor está de pé   |

## Publicando no GitHub

No próprio Ubuntu Server, dentro da pasta `todo-app`:

```bash
git init
git add .
git commit -m "Primeira versão do todo-app"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/todo-app.git
git push -u origin main
```

(Crie antes o repositório vazio em github.com/new — sem README, sem .gitignore, para não gerar conflito.)

## Rodando como serviço via Systemd (Fase 2 do seu plano)

Exemplo de unit file (`/etc/systemd/system/todo-app.service`):

```ini
[Unit]
Description=Todo App (Node/Express)
After=network.target

[Service]
Type=simple
User=SEU_USUARIO
WorkingDirectory=/var/www/apps/todo-app
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=8000

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now todo-app
sudo systemctl status todo-app
```

Depois disso, basta apontar o Ngrok (Fase 3 do seu plano) para a porta 8000 da VM.
