# Travel Manager

> Plataforma SaaS pessoal e familiar para gerenciamento, planejamento, acompanhamento e histórico de viagens.

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://web.dev/progressive-web-apps/)

---

## 1. Visão Geral

O **Travel Manager** foi desenvolvido sob abordagem *mobile-first*, com suporte integral a PWA (*Progressive Web App*) e modo offline com sincronização em lote.

A aplicação centraliza:
- **Autenticação & Família:** Cadastro, login com JWT, recuperação de senha, grupo familiar colaborativo e convites para participantes.
- **Viagens & Múltiplos Destinos:** Gestão de viagens por categorias e status, catálogo permanente reutilizável de destinos e atrações.
- **Roteiros & Atividades:** Programação diária de passeios, horários, custos estimados e catálogo de atividades sem data fixa.
- **Reservas & Transportes:** Hospedagens, voos, passagens terrestres, restaurantes, ingressos e apólices de seguro-viagem, com vínculo automático para despesas.
- **Documentos Protegidos:** Upload e download de passaportes, vistos, RG, CNH, bilhetes e vouchers (PDF, JPG, PNG) protegidos por grupo familiar.
- **Gestão Financeira em Reais (R$):** Orçamentos por categoria, extrato de despesas pagas/pendentes, divisão de despesas entre familiares e gráficos de acompanhamento.
- **Organização & Checklists:** Checklists de preparativos e listas individuais de bagagem por familiar (roupas, medicamentos, eletrônicos, etc.).
- **Contatos de Emergência:** Telefones úteis acessíveis offline com discagem rápida por um toque.
- **Inteligência Artificial:** Assistente de viagens para sugestão de roteiros diários, dicas de restaurantes, interpretação de comprovantes e busca por linguagem natural.
- **Integrações Externas:** Google Maps, previsão meteorológica em tempo real, links de álbuns do Google Fotos e exportação de compromissos no formato iCalendar (`.ics`) para Google Agenda e Apple Calendar.
- **Relatórios & Portabilidade:** Emissão de relatórios em PDF (ReportLab), exportação de planilhas Excel (`.xlsx`), importação/exportação JSON e rotina de backup/restauração completa compactada em ZIP com retenção automática dos últimos 4 arquivos.

---

## 2. Arquitetura e Tecnologias

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Interface responsiva mobile-first com Vite |
| **Estilização** | Tailwind CSS + Lucide Icons | Design moderno com suporte nativo a Tema Claro e Escuro |
| **Mobile / Offline** | PWA + Service Worker + LocalStorage | PWA instalável com fila de sincronização offline |
| **Backend** | Python 3.12 + FastAPI | API REST modular, autenticação JWT e validação Pydantic v2 |
| **ORM & Migrations** | SQLAlchemy 2.0 + Alembic | Modelagem relacional e versionamento do banco |
| **Banco de Dados** | PostgreSQL 16 (Docker/VPS) / SQLite (Dev) | Persistência relacional robusta |
| **Infraestrutura** | Docker + Docker Compose | Ambientes isolados para desenvolvimento e produção na VPS |

---

## 3. Como Executar Localmente

### Pré-requisitos
- Python 3.12+
- Node.js 20+ e npm

### 3.1 Backend
```bash
cd backend
python -m venv .venv

# No Windows (PowerShell):
.\.venv\Scripts\activate
# No Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 3025
```
A API estará disponível em: `http://localhost:3025`  
Documentação Swagger interativa: `http://localhost:3025/docs`

### 3.2 Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend estará acessível em: `http://localhost:3024`

---

## 4. Execução com Docker Compose

Para subir o banco PostgreSQL, o backend e o frontend juntos:
```bash
cp .env.example .env
docker compose up -d --build
```

Serviços iniciados:
- **Frontend PWA:** `http://localhost:3024`
- **Backend FastAPI:** `http://localhost:3025`
- **PostgreSQL:** `localhost:3026`

---

## 5. Como Implantar na VPS Hostinger

1. **Acesse sua VPS via SSH:**
   ```bash
   ssh root@sua_vps_ip
   ```

2. **Clone o repositório:**
   ```bash
   git clone https://github.com/alesauer/malukiviagens.git /var/www/travelmanager
   cd /var/www/travelmanager
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Defina senhas seguras para `POSTGRES_PASSWORD`, `APP_SECRET_KEY`, além da chave `OPENAI_API_KEY` se desejar ativar o assistente externo.

4. **Inicie os containers de produção:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

5. **Configuração de Proxy Reverso (Nginx com Certbot SSL):**
   ```nginx
   server {
       server_name viagens.seudominio.com;

       location / {
           proxy_pass http://127.0.0.1:3024;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:3025/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   Ative o SSL com `certbot --nginx -d viagens.seudominio.com`.

---

## 6. Testes Automatizados

Para rodar a suíte completa de testes no backend:
```bash
cd backend
.\.venv\Scripts\pytest.exe -v
```

Para validar a compilação e verificação de tipos do frontend:
```bash
cd frontend
npm run build
```

---

## 7. Repositório Oficial

Repositório no GitHub:  
[https://github.com/alesauer/malukiviagens.git](https://github.com/alesauer/malukiviagens.git)

