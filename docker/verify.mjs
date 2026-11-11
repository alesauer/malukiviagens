import { execSync } from 'child_process';

const query = `
SELECT kind, title, cost, confirmation_code 
FROM public.reservations 
WHERE trip_id = '76cc0806-7088-4399-9085-35d2b78d0d2f'
ORDER BY starts_at;
`;

const res = execSync(`docker compose exec -T db psql -U postgres -d postgres -c "${query.trim().replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
console.log(res);
