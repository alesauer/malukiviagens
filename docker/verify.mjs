import { execSync } from 'child_process';

const query = `
SELECT 'trips' as tbl, count(*) as mojibake_count FROM public.trips WHERE title LIKE '%Ã%' OR description LIKE '%Ã%' OR main_destination LIKE '%Ã%'
UNION ALL
SELECT 'activities', count(*) FROM public.activities WHERE title LIKE '%Ã%' OR notes LIKE '%Ã%' OR location LIKE '%Ã%'
UNION ALL
SELECT 'reservations', count(*) FROM public.reservations WHERE title LIKE '%Ã%' OR notes LIKE '%Ã%' OR address LIKE '%Ã%'
UNION ALL
SELECT 'expenses', count(*) FROM public.expenses WHERE description LIKE '%Ã%'
UNION ALL
SELECT 'checklist_items', count(*) FROM public.checklist_items WHERE title LIKE '%Ã%'
UNION ALL
SELECT 'emergency_contacts', count(*) FROM public.emergency_contacts WHERE name LIKE '%Ã%' OR notes LIKE '%Ã%';
`;

const res = execSync(`docker compose exec -T db psql -U postgres -d postgres -c "${query.trim().replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
console.log(res);
