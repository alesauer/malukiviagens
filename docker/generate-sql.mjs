import fs from 'fs';
import path from 'path';

const rawData = fs.readFileSync('docker/data-export.json', 'utf8');
const data = JSON.parse(rawData);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function parseMoney(valStr) {
  if (!valStr) return 0;
  const match = String(valStr).match(/R\$\s*([\d\.,]+)/);
  if (match) {
    return parseFloat(match[1].replace(/\./g, '').replace(',', '.')) || 0;
  }
  const matchUsd = String(valStr).match(/US\$\s*([\d\.,]+)/);
  if (matchUsd) {
    const usd = parseFloat(matchUsd[1].replace(',', '.')) || 0;
    return Math.round(usd * 5.5); // aproximado em R$
  }
  return 0;
}

let sql = `-- Script de importação gerado automaticamente para Maluki Viagens
-- Gerado a partir de docker/data-export.json

DO $$
DECLARE
  v_family_id uuid;
  v_user_id uuid;
  v_trip_id uuid;
  v_hist_trip_id uuid;
BEGIN
  -- 1. Identificar usuário e família
  SELECT m.family_id, m.user_id 
  INTO v_family_id, v_user_id
  FROM public.family_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE u.email = 'alesauer@gmail.com'
  LIMIT 1;

  IF v_family_id IS NULL THEN
    SELECT id, created_by INTO v_family_id, v_user_id FROM public.families LIMIT 1;
  END IF;

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma família encontrada para importar dados.';
  END IF;

  RAISE NOTICE 'Importando para a família: %, usuário: %', v_family_id, v_user_id;

  -- 2. Limpar viagens anteriores da família para evitar duplicidade
  DELETE FROM public.trips WHERE family_id = v_family_id;

  -- 3. Inserir Viagem Atual: Santa Cruz de la Sierra
  INSERT INTO public.trips (
    family_id,
    created_by,
    title,
    category,
    status,
    start_date,
    end_date,
    main_destination,
    description,
    budget
  ) VALUES (
    v_family_id,
    v_user_id,
    ${escapeSql(data.viagem_atual.titulo)},
    'ferias',
    'confirmada',
    ${escapeSql(data.viagem_atual.inicio)},
    ${escapeSql(data.viagem_atual.fim)},
    ${escapeSql(data.viagem_atual.titulo + ', ' + data.viagem_atual.pais)},
    ${escapeSql(data.viagem_atual.duracaoDestino + ' | Viajantes: ' + data.viagem_atual.viajantes + ' | Estilo: ' + (data.viagem_atual.estilo || []).join(', '))},
    5500.00
  ) RETURNING id INTO v_trip_id;

  RAISE NOTICE 'Viagem atual inserida com ID: %', v_trip_id;

`;

// Hospedagens
if (Array.isArray(data.hospedagens)) {
  for (const h of data.hospedagens) {
    const cost = parseMoney(h.valor);
    const notes = [
      h.quarto ? `Quarto: ${h.quarto}` : null,
      h.refeicao ? `Refeição: ${h.refeicao}` : null,
      h.pin ? `PIN: ${h.pin}` : null,
      h.telefone ? `Telefone: ${h.telefone}` : null,
      ...(h.observacoes || [])
    ].filter(Boolean).join('\n');

    const startsAt = `${h.periodo_estadia.checkin} ${h.horarios?.checkin || '14:00'}:00`;
    const endsAt = `${h.periodo_estadia.checkout} ${h.horarios?.checkout || '11:00'}:00`;

    sql += `  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, address, maps_url, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    ${escapeSql(h.destino + ' (' + h.cidade + ')')},
    ${escapeSql(h.plataforma || 'Booking.com')},
    ${escapeSql(startsAt)}::timestamptz,
    ${escapeSql(endsAt)}::timestamptz,
    ${escapeSql(h.codigo_reserva)},
    ${cost},
    false,
    ${escapeSql(h.endereco)},
    ${escapeSql(h.maps_url)},
    ${escapeSql(notes)}
  );
`;
  }
}

// Voos de Ida
if (Array.isArray(data.voos_ida)) {
  for (const v of data.voos_ida) {
    const startsAt = `${v.data} ${v.horario_saida}`;
    const endsAt = `${v.data} ${v.horario_chegada}`;
    const notes = [
      v.origem_cidade && v.destino_cidade ? `${v.origem_cidade} → ${v.destino_cidade}` : null,
      v.tarifa ? `Tarifa: ${v.tarifa}` : null,
      v.bagagem ? `Bagagem: ${v.bagagem}` : null,
      v.bilhete ? `Bilhete: ${v.bilhete}` : null,
      v.observacao
    ].filter(Boolean).join('\n');

    sql += `  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'voo',
    ${escapeSql('Voo ' + v.voo + ' (' + v.origem + ' → ' + v.destino + ')')},
    ${escapeSql(v.companhia)},
    ${escapeSql(startsAt)}::timestamptz,
    ${escapeSql(endsAt)}::timestamptz,
    ${escapeSql(v.codigo_viagem)},
    0,
    true,
    ${escapeSql(notes)}
  );
`;
  }
}

// Voos de Volta
if (Array.isArray(data.voos_volta)) {
  for (const v of data.voos_volta) {
    const startsAt = `${v.data} ${v.horario_saida}`;
    const endsAt = `${v.data} ${v.horario_chegada}`;
    const notes = [
      v.origem_cidade && v.destino_cidade ? `${v.origem_cidade} → ${v.destino_cidade}` : null,
      v.tarifa ? `Tarifa: ${v.tarifa}` : null,
      v.bagagem ? `Bagagem: ${v.bagagem}` : null,
      v.bilhete ? `Bilhete: ${v.bilhete}` : null,
      v.observacao
    ].filter(Boolean).join('\n');

    sql += `  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'voo',
    ${escapeSql('Voo ' + v.voo + ' (' + v.origem + ' → ' + v.destino + ')')},
    ${escapeSql(v.companhia)},
    ${escapeSql(startsAt)}::timestamptz,
    ${escapeSql(endsAt)}::timestamptz,
    ${escapeSql(v.codigo_viagem)},
    0,
    true,
    ${escapeSql(notes)}
  );
`;
  }
}

// Roteiro (Activities)
if (Array.isArray(data.roteiro)) {
  for (const dia of data.roteiro) {
    if (!Array.isArray(dia.locais)) continue;
    for (const loc of dia.locais) {
      let timeVal = null;
      if (loc.horario && /^([01]?[0-9]|2[0-3]):[0-5][0-9]/.test(loc.horario)) {
        timeVal = `${loc.horario.slice(0, 5)}:00`;
      }
      const notes = [
        loc.descricao,
        loc.dica ? `💡 Dica: ${loc.dica}` : null,
        loc.restaurantes ? `🍽️ Restaurantes: ${loc.restaurantes}` : null,
        loc.arredores ? `Arredores: ${loc.arredores}` : null,
        loc.link_trajeto ? `Maps: ${loc.link_trajeto}` : null
      ].filter(Boolean).join('\n\n');

      sql += `  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    ${escapeSql(loc.nome)},
    ${escapeSql(dia.data)},
    ${timeVal ? escapeSql(timeVal) + '::time' : 'NULL'},
    ${escapeSql(loc.nome)},
    0,
    ${escapeSql(notes)},
    false
  );
`;
    }
  }
}

// Contatos de Emergência do Seguro
if (data.seguro_viagem?.contatos_emergencia) {
  const em = data.seguro_viagem.contatos_emergencia;
  if (em.brasil) {
    sql += `  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
    VALUES (v_trip_id, v_family_id, 'MasterAssist / Seguro Viagem (Brasil)', ${escapeSql(em.brasil)}, ${escapeSql(em.observacao || '')});
`;
  }
  if (em.internacional_collect_call) {
    sql += `  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
    VALUES (v_trip_id, v_family_id, 'MasterAssist (Internacional a Cobrar)', ${escapeSql(em.internacional_collect_call)}, ${escapeSql(em.observacao || '')});
`;
  }
  if (data.seguro_viagem?.seguradora?.assistencia) {
    sql += `  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
    VALUES (v_trip_id, v_family_id, 'SAC AIG Seguros 24h', '0800 726 6130', ${escapeSql(data.seguro_viagem.seguradora.assistencia)});
`;
  }
}

// Checklist de Preparo e Bagagem
sql += `  INSERT INTO public.checklist_items (trip_id, family_id, kind, title, owner_name, done) VALUES
    (v_trip_id, v_family_id, 'preparo', 'Confirmar cama extra no Hotel By Armonía', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Levar dólares em espécie para pagamento da hospedagem', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Verificar funcionamento dos atrativos na Semana Santa', 'Família', false),
    (v_trip_id, v_family_id, 'preparo', 'Emitir bilhetes e apólices do seguro MasterAssist / AIG', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Planejar transfer entre Congonhas e Guarulhos na volta', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Passaportes válidos de todos os viajantes', 'Família', true),
    (v_trip_id, v_family_id, 'bagagem', 'Repelente e protetor solar (Biocentro Güembé e Samaipata)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Roupas de banho para áreas de lazer e piscina', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Carregadores de celular e adaptadores de tomada', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Farmacinha básica e receitas médicas', 'Família', false);
`;

// Despesas Iniciais Estimadas / Pagas
sql += `  INSERT INTO public.expenses (trip_id, family_id, description, category, amount, paid, paid_by, spent_on) VALUES
    (v_trip_id, v_family_id, 'Hospedagem Airport Hotel Gru (Ida)', 'hospedagem', 489.00, false, 'maluki', '2027-03-24'),
    (v_trip_id, v_family_id, 'Hospedagem Hotel By Armonía (US$ 318,55)', 'hospedagem', 1749.00, false, 'maluki', '2027-03-25'),
    (v_trip_id, v_family_id, 'Hospedagem Airport Hotel Gru (Volta)', 'hospedagem', 489.00, false, 'maluki', '2027-03-30');
`;

// Histórico de Viagens
if (Array.isArray(data.historico_de_viagens)) {
  for (const t of data.historico_de_viagens) {
    // Determinar datas
    let sDate = t.date?.start;
    let eDate = t.date?.end;

    // Se start não estiver no formato AAAA-MM-DD
    if (!sDate || !/^\d{4}-\d{2}-\d{2}$/.test(sDate)) {
      // Usar data fallback com base no slug ou ano
      const yearMatch = t.slug?.match(/20\d\d/) || t.title?.match(/20\d\d/);
      const year = yearMatch ? yearMatch[0] : '2018';
      sDate = `${year}-01-10`;
      eDate = `${year}-01-15`;
    } else if (!eDate || !/^\d{4}-\d{2}-\d{2}$/.test(eDate)) {
      // Adicionar 5 dias ao start
      const d = new Date(sDate);
      d.setDate(d.getDate() + 5);
      eDate = d.toISOString().slice(0, 10);
    }

    const destination = (t.places || []).join(', ') || t.title;
    const descParts = [
      t.people?.length ? `Com: ${t.people.join(', ')}` : null,
      t.planning ? `Planejamento: ${t.planning}` : null,
      t.date?.display ? `Período: ${t.date.display}` : null
    ].filter(Boolean).join(' | ');

    sql += `  INSERT INTO public.trips (
    family_id,
    created_by,
    title,
    category,
    status,
    start_date,
    end_date,
    main_destination,
    description,
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    ${escapeSql(t.title)},
    'ferias',
    'realizada',
    ${escapeSql(sDate)},
    ${escapeSql(eDate)},
    ${escapeSql(destination)},
    ${escapeSql(descParts || null)},
    ${escapeSql(t.gallery || null)}
  );
`;
  }
}

sql += `
  RAISE NOTICE 'Importação concluída com sucesso!';
END $$;
`;

fs.writeFileSync('docker/import.sql', sql, 'utf8');
console.log('Script docker/import.sql gerado com sucesso!');

