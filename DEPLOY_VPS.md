# Guia de Deploy na VPS com Apache e Docker Compose — Maluki Viagens

Este guia orienta o deploy do **Maluki Viagens** em uma VPS Linux com **Apache** como proxy reverso (gerenciando SSL/HTTPS) e os serviços rodando em **Docker Compose** (aplicação Node.js/TanStack Start, PostgreSQL local, GoTrue Auth, Storage e Kong Gateway).

---

## 1. Pré-requisitos na VPS

1. **Acesso SSH** com permissões sudo.
2. **Apache2** instalado e ativo na VPS:
   ```bash
   sudo apt update
   sudo apt install -y apache2 certbot python3-certbot-apache
   ```
3. **Módulos do Apache necessários:**
   ```bash
   sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl
   sudo systemctl restart apache2
   ```
4. **Docker & Docker Compose** instalados:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
5. **Domínio apontado via DNS:**
   * Tipo `A` apontando seu domínio (ex: `viagens.seudominio.com`) para o IP da VPS.

---

## 2. Configurar e Iniciar os Containers Docker

### Passo 1: Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO_GITHUB>
cd MalukiViagens
```

### Passo 2: Gerar as Chaves do Supabase e Banco
Execute o utilitário incluído no projeto:
```bash
node docker/generate-keys.mjs
```
Guarde as chaves geradas (`POSTGRES_PASSWORD`, `JWT_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Passo 3: Configurar o `.env`
```bash
cp .env.example .env
nano .env
```
Preencha:
* `SITE_URL`: sua URL completa (ex: `https://viagens.seudominio.com`)
* `POSTGRES_PASSWORD`, `JWT_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (geradas no Passo 2)
* `DEEPSEEK_API_KEY`: sua chave de API da DeepSeek

### Passo 4: Subir os Containers
```bash
docker compose up -d --build
```
Os containers escutarão em modo seguro no localhost da VPS:
* Aplicação Web: `127.0.0.1:3000`
* Kong Gateway (APIs do Supabase): `127.0.0.1:8000`

---

## 3. Configurar o Apache como Proxy Reverso

Copie o modelo de VirtualHost do projeto para o Apache:
```bash
sudo cp docker/apache-vhost.conf /etc/apache2/sites-available/maluki.conf
```

Edite o arquivo e ajuste o seu domínio:
```bash
sudo nano /etc/apache2/sites-available/maluki.conf
```
*(Substitua `viagens.seudominio.com` pelo seu domínio real).*

Ative o site no Apache:
```bash
sudo a2ensite maluki.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### Emitir o Certificado SSL Gratuito com Certbot
```bash
sudo certbot --apache -d viagens.seudominio.com
```

Pronto! O Certbot configurará os certificados HTTPS automaticamente no Apache.

---

## 4. Comandos Úteis

* **Ver logs dos containers:** `docker compose logs -f`
* **Status dos containers:** `docker compose ps`
* **Reiniciar aplicação:** `docker compose restart app`
* **Backup diário do banco Postgres:**
  ```bash
  docker exec -t maluki_db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
  ```
