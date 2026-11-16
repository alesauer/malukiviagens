import { execSync } from 'child_process';
import path from 'path';

const file = process.argv[2];
if (!file) {
  console.error('Uso: node docker/exec-sql.mjs <arquivo.sql>');
  process.exit(1);
}

const baseName = path.basename(file);
console.log(`Copiando ${file} para o container malukiviagens-db...`);
execSync(`docker cp "${file}" malukiviagens-db:/tmp/${baseName}`);
console.log(`Executando ${baseName} com encoding UTF-8 no PostgreSQL...`);
execSync(`docker compose exec -T db psql -U postgres -d postgres -f /tmp/${baseName}`, { stdio: 'inherit' });
console.log(`Sucesso: ${file} aplicado sem distorção de caracteres.`);

