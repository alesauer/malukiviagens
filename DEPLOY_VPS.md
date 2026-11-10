# Guia de Deploy na VPS com Docker Compose — Maluki Viagens

Este guia orienta como subir e rodar toda a infraestrutura do **Maluki Viagens** em uma VPS Linux (Ubuntu 22.04 / 24.04 LTS), com banco de dados PostgreSQL local, autenticação Supabase GoTrue, storage de arquivos, Kong Gateway, Caddy com SSL automático e assistente DeepSeek.

---

## 1. Pré-requisitos na VPS

1. **Acesso SSH** como root ou usuário sudo.
2. **Domínio ou subdomínio** apontado via DNS tipo `A` para o endereço IP da sua VPS:
   * Exemplo: `viagens.seudominio.com` -> `IP.DA.SUA.VPS`
3. **Docker & Docker Compose** instalados:
   ```bash
   # Instalação rápida do Docker oficial
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   # Ativar docker compose
   sudo systemctl enable --now docker
   ```
4. **Portas Liberadas no Firewall:**
   * `80/tcp` (HTTP para emissão de certificado Let's Encrypt)
   * `443/tcp` (HTTPS tráfego seguro)
   * `22/tcp` (SSH)

---

## 2. Instalação e Configuração

### Passo 1: Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO_GITHUB>
cd MalukiViagens
```

### Passo 2: Gerar as Chaves do Supabase e Banco
Execute o gerador automático para criar o `POSTGRES_PASSWORD`, `JWT_SECRET`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`:
```bash
node docker/generate-keys.mjs
```

### Passo 3: Configurar o `.env`
Copie o modelo de variáveis de ambiente:
```bash
cp .env.example .env
nano .env
```
Preencha os valores:
* `SITE_DOMAIN`: seu domínio (ex: `viagens.seudominio.com`)
* `SITE_URL`: sua URL completa (ex: `https://viagens.seudominio.com`)
* `ACME_EMAIL`: seu e-mail para o certificado SSL do Caddy
* Cole as chaves geradas no Passo 2 (`POSTGRES_PASSWORD`, `JWT_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
* `DEEPSEEK_API_KEY`: sua chave de API DeepSeek obtida em [platform.deepseek.com](https://platform.deepseek.com)

---

## 3. Subir os Containers

Execute:
```bash
docker compose up -d --build
```

O Docker irá:
1. Compilar a aplicação TanStack Start / Node.js no container `maluki_app`.
2. Inicializar o PostgreSQL `maluki_db` e executar automaticamente o script `docker/init-db/01-init.sql` (criando tabelas, RLS, functions e bucket `documents`).
3. Subir o `maluki_auth` (GoTrue) conectado ao Postgres local.
4. Subir o `maluki_rest` (PostgREST) e `maluki_storage` (armazenamento local).
5. Subir o `maluki_kong` (unificando as rotas de API).
6. Subir o `maluki_caddy`, que obterá o certificado SSL do Let's Encrypt automaticamente para o seu domínio.

---

## 4. Verificação de Status

Para acompanhar os logs de inicialização:
```bash
docker compose logs -f
```

Para verificar o status dos containers:
```bash
docker compose ps
```

Todos os serviços devem estar no status `Up` ou `healthy`.

---

## 5. Rotina de Backup do Banco Local

Para fazer o backup diário dos dados, crie uma tarefa no cron:
```bash
# Exemplo de comando de backup:
docker exec -t maluki_db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```
