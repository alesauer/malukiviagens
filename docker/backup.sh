#!/usr/bin/env bash
# ==============================================================================
# Script de Backup do Banco de Dados - Maluki Viagens
# Uso: ./docker/backup.sh
# ==============================================================================

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/maluki_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "==> Iniciando backup do PostgreSQL (maluki_db)..."
docker exec -t maluki_db pg_dump -U postgres postgres | gzip > "$FILENAME"

echo "==> Backup concluído com sucesso em: $FILENAME"
echo "==> Tamanho do arquivo: $(du -h "$FILENAME" | cut -f1)"

# Manter apenas os últimos 15 backups
find "$BACKUP_DIR" -type f -name "maluki_backup_*.sql.gz" -mtime +15 -delete
echo "==> Backups antigos (>15 dias) limpos."
