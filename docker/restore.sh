#!/usr/bin/env bash
# ==============================================================================
# Script de Restauração do Banco de Dados - Maluki Viagens
# Uso: ./docker/restore.sh ./backups/maluki_backup_YYYYMMDD_HHMMSS.sql.gz
# ==============================================================================

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Erro: Forneça um arquivo de backup válido."
  echo "Uso: $0 <caminho_do_backup.sql.gz>"
  exit 1
fi

read -p "ATENÇÃO: Isso irá sobrescrever o banco de dados atual. Deseja continuar? (s/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
  echo "Operação cancelada."
  exit 0
fi

echo "==> Restaurando $BACKUP_FILE para maluki_db..."
gunzip -c "$BACKUP_FILE" | docker exec -i maluki_db psql -U postgres -d postgres

echo "==> Restauração concluída com sucesso!"
