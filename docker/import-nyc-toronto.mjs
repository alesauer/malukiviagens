import fs from 'fs';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- Atualização completa da viagem Nova York e Toronto 2026
DO $$
DECLARE
  v_family_id uuid;
  v_user_id uuid;
  v_trip_id uuid;
BEGIN
  -- 1. Obter usuário e família
  SELECT m.family_id, m.user_id 
  INTO v_family_id, v_user_id
  FROM public.family_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE u.email = 'alesauer@gmail.com'
  LIMIT 1;

  IF v_family_id IS NULL THEN
    SELECT id, created_by INTO v_family_id, v_user_id FROM public.families LIMIT 1;
  END IF;

  -- 2. Localizar a viagem existente ou criar
  SELECT id INTO v_trip_id 
  FROM public.trips 
  WHERE family_id = v_family_id AND (title ILIKE '%Nova York e Toronto%' OR title ILIKE '%NYC e Toronto%')
  LIMIT 1;

  IF v_trip_id IS NULL THEN
    INSERT INTO public.trips (
      family_id, created_by, title, category, status, start_date, end_date, main_destination, description, budget
    ) VALUES (
      v_family_id, v_user_id, 'Nova York e Toronto', 'ferias', 'confirmada', '2026-03-27', '2026-04-06',
      'Nova York, EUA e Toronto, Canadá',
      'Roteiro em família combinando Nova York (Manhattan, Bronx, Jersey Gardens) e Canadá (Toronto, Cataratas do Niágara e Niagara-on-the-Lake).',
      23267.71
    ) RETURNING id INTO v_trip_id;
  ELSE
    UPDATE public.trips SET
      title = 'Nova York e Toronto',
      category = 'ferias',
      status = 'confirmada',
      start_date = '2026-03-27',
      end_date = '2026-04-06',
      main_destination = 'Nova York, EUA e Toronto, Canadá',
      description = 'Roteiro em família combinando Nova York (Manhattan, Bronx, Jersey Gardens) e Canadá (Toronto, Cataratas do Niágara e Niagara-on-the-Lake).',
      budget = 23267.71
    WHERE id = v_trip_id;
  END IF;

  RAISE NOTICE 'Atualizando viagem ID: %', v_trip_id;

  -- 3. Limpar registros dependentes anteriores desta viagem para atualização completa
  DELETE FROM public.activities WHERE trip_id = v_trip_id;
  DELETE FROM public.reservations WHERE trip_id = v_trip_id;
  DELETE FROM public.expenses WHERE trip_id = v_trip_id;
  DELETE FROM public.checklist_items WHERE trip_id = v_trip_id;
  DELETE FROM public.emergency_contacts WHERE trip_id = v_trip_id;

  -- 4. Inserir Hospedagens (3 estadias)
  -- 4.1 Airbnb New Jersey (Ida)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Airbnb West New York (Mehmet) - Estadia 1',
    'Airbnb',
    '2026-03-28 14:00:00'::timestamptz,
    '2026-03-31 10:00:00'::timestamptz,
    '19 64th Street, 306 West New York, NJ 07093',
    'HM9KZY9FZ8',
    2600.00,
    true,
    'Anfitrião: Mehmet (+1 201 423-8926). Check-in 14h / Check-out 10h. Perto de transporte para Manhattan e Walmart NJ.'
  );

  -- 4.2 Airbnb Toronto
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Airbnb Toronto (Willian)',
    'Airbnb',
    '2026-03-31 14:00:00'::timestamptz,
    '2026-04-03 12:00:00'::timestamptz,
    '138 Kenwood Avenue, Toronto, Ontário M6C 2S3, Canadá',
    'HMCN3ENATY',
    2499.37,
    true,
    'Anfitrião: Willian (+1 416-705-4060). Check-in 14h / Check-out 12h. Cancelamento grátis até 25/03/2026.'
  );

  -- 4.3 Airbnb New Jersey (Retorno)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Airbnb West New York (Mehmet) - Estadia 2',
    'Airbnb',
    '2026-04-03 14:00:00'::timestamptz,
    '2026-04-05 10:00:00'::timestamptz,
    '19 64th Street, 306 West New York, NJ 07093',
    'HM9KZY9FZ8',
    2300.00,
    true,
    'Retorno do Canadá para NYC antes do voo de volta ao Brasil. Anfitrião: Mehmet (+1 201 423-8926).'
  );

  -- 5. Inserir Aluguel de Carro (SIXT Toronto)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'veiculo',
    'Aluguel Toyota RAV4 ou similar (SIXT)',
    'SIXT (Parceria Livelo)',
    '2026-03-31 12:30:00'::timestamptz,
    '2026-04-03 11:30:00'::timestamptz,
    '200 Wellington St W, Cru 20, Metrocentre-wellington Tower, Toronto, Canada, M5V 3C7',
    '789661613',
    2163.00,
    true,
    'SUV Automático, 4 portas, 5 lugares. Retirada em Toronto Downtown (12h30) e devolução no Aeroporto Billy Bishop (YTZ) às 11h30. Contato: +1 888 749 8227. Confirmado para alesauer@gmail.com.'
  );

  -- 6. Inserir Voos
  -- 6.1 Ida Brasil -> NYC (Avianca CBJDOS)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES 
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AV 4612 — Belo Horizonte (CNF) → Rio de Janeiro (GIG)',
      'Avianca / Gol',
      '2026-03-27 20:45:00'::timestamptz,
      '2026-03-27 21:50:00'::timestamptz,
      'CBJDOS',
      1122.70,
      true,
      'Primeiro trecho de ida. Bilhetes: Alexandre (134-2150701154), Matheus (134-2150701153), Cristiane (134-2150701152).'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AV 198 — Rio de Janeiro (GIG) → Bogotá (BOG)',
      'Avianca',
      '2026-03-28 01:45:00'::timestamptz,
      '2026-03-28 06:05:00'::timestamptz,
      'CBJDOS',
      1122.70,
      true,
      'Conexão internacional para os Estados Unidos via Bogotá.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AV 210 — Bogotá (BOG) → Nova York (JFK)',
      'Avianca',
      '2026-03-28 07:05:00'::timestamptz,
      '2026-03-28 13:55:00'::timestamptz,
      'CBJDOS',
      1122.70,
      true,
      'Chegada em Nova York às 13:55. Deslocamento para o Airbnb em West New York.'
    );

  -- 6.2 Voos NYC <-> Toronto (Air Canada A3TX2V)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES 
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AC 8533 — New York (LGA Terminal B) → Toronto (YTZ)',
      'Air Canada Express',
      '2026-03-31 10:00:00'::timestamptz,
      '2026-03-31 11:39:00'::timestamptz,
      'A3TX2V',
      2446.25,
      true,
      'Desembarque no aeroporto central Billy Bishop (YTZ), próximo a Downtown Toronto.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AC 8536 — Toronto (YTZ) → New York (LGA Terminal B)',
      'Air Canada Express',
      '2026-04-03 14:20:00'::timestamptz,
      '2026-04-03 15:41:00'::timestamptz,
      'A3TX2V',
      2446.25,
      true,
      'Chegar no aeroporto às 11:30 após devolução do carro. Chegada em Nova York às 15:41.'
    );

  -- 6.3 Volta NYC -> Brasil (Avianca C3ULVL / LifeMiles 13549556020)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES 
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AV 211 — Nova York (JFK) → Bogotá (BOG)',
      'Avianca',
      '2026-04-05 15:35:00'::timestamptz,
      '2026-04-05 20:30:00'::timestamptz,
      'C3ULVL',
      0,
      true,
      'Saída para aeroporto entre 11h30 e 12h. Bilhetes: Alexandre (134-2150701151), Matheus (134-2150701150), Cristiane (134-2150701149).'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AV 261 — Bogotá (BOG) → Rio de Janeiro (GIG)',
      'Avianca',
      '2026-04-05 21:55:00'::timestamptz,
      '2026-04-06 06:15:00'::timestamptz,
      'C3ULVL',
      0,
      true,
      'Voo noturno de retorno para o Brasil.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo AV 4622 — Rio de Janeiro (GIG) → Belo Horizonte (CNF)',
      'Avianca / Gol',
      '2026-04-06 09:00:00'::timestamptz,
      '2026-04-06 10:10:00'::timestamptz,
      'C3ULVL',
      0,
      true,
      'Chegada final em Belo Horizonte às 10:10.'
    );

  -- 7. Roteiro Dia a Dia (Activities)
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    -- Sexta 27/03
    (v_trip_id, v_family_id, 'Embarque em Belo Horizonte (CNF → GIG)', '2026-03-27', '20:45:00', 'Aeroporto de Confins', 'Voo AV 4612 rumo ao Rio de Janeiro para início da viagem internacional.', false),

    -- Sábado 28/03
    (v_trip_id, v_family_id, 'Chegada em NYC e Check-in no Airbnb New Jersey', '2026-03-28', '14:00:00', '19 64th Street, West New York, NJ', 'Pouso às 13:55, imigração e transfer de Uber até West New York (aprox. $65).\nCheck-in no Airbnb com anfitrião Mehmet.', false),
    (v_trip_id, v_family_id, 'Compras no Walmart de NJ e Jantar no Applebee''s', '2026-03-28', '18:00:00', 'Walmart New Jersey', 'Compras de mantimentos, café e lanches no Walmart de NJ. Jantar descontraído no Applebee''s do complexo.', false),

    -- Domingo 29/03
    (v_trip_id, v_family_id, 'Explorando Manhattan (Região Central)', '2026-03-29', '09:30:00', 'Manhattan, Nova York', 'Passeio a pé e de metrô pelo coração de Manhattan:\n- Times Square e Broadway\n- Caminhada pelo Central Park\n- 5ª Avenida, Rockefeller Center e St. Patrick''s Cathedral\n- Opções de almoço/jantar: Los Tacos No. 1, Bleecker Street Pizza, Ellen''s Stardust Diner (garçons cantores, super divertido para famílias/adolescentes), Katz''s Delicatessen ou Junior''s Cheesecake.', false),

    -- Segunda 30/03
    (v_trip_id, v_family_id, 'Bronx: Escadaria do Coringa e Compras na Burlington', '2026-03-30', '08:30:00', 'Bronx, Nova York', 'Ida cedo de metrô para o Bronx:\n- Visita à icônica Escadaria do Coringa (Joker Stairs na 1165 Shakespeare Ave)\n- Compras de roupas e calçados com desconto na Burlington\n- Passagem pelo Franz Sigel Park e exterior do Yankee Stadium.', false),

    -- Terça 31/03
    (v_trip_id, v_family_id, 'Voo para Toronto e Retirada do Carro SIXT', '2026-03-31', '10:00:00', 'LGA Terminal B → Toronto YTZ', 'Saída de New Jersey para o aeroporto LaGuardia (LGA Terminal B).\nVoo AC 8533 às 10:00, chegando em Toronto (YTZ) às 11:39.\nRetirada do SUV Toyota RAV4 na locadora SIXT em Downtown (200 Wellington St W) às 12h30.', false),
    (v_trip_id, v_family_id, 'Check-in no Airbnb Toronto e Harbourfront', '2026-03-31', '14:00:00', '138 Kenwood Ave, Toronto', 'Check-in no Airbnb (anfitrião Willian).\nTarde de caminhada no Harbourfront na orla do Lago Ontário.', false),
    (v_trip_id, v_family_id, 'CN Tower e Jantar no Distillery District', '2026-03-31', '17:00:00', 'CN Tower, Toronto', 'Subida na famosa CN Tower para vista espetacular da cidade.\nÀ noite: Jantar no charmoso bairro histórico de paralelepípedos Distillery District (restaurantes artesanais e cafés).', false),

    -- Quarta 01/04
    (v_trip_id, v_family_id, 'Toronto Profunda: Kensington Market, U of T e Yorkville', '2026-04-01', '09:30:00', 'Toronto Centro e Bairros', 'Passeio completo pelos bairros mais emblemáticos de Toronto:\n- Bairro boêmio Kensington Market e lojas vintage\n- Campus histórico da University of Toronto\n- Elegante bairro de Yorkville\n- Opções culturais: Royal Ontario Museum (ROM) ou balsa para Toronto Islands\n- Dica de restaurante perto: Cafe Landwer (165 University Ave) ou St Lawrence Pizza & Pasta.', false),
    (v_trip_id, v_family_id, 'Walmart Toronto (Dufferin St) e Jantar Jimmy The Greek', '2026-04-01', '18:30:00', '900 Dufferin St, Toronto', 'Ida ao Walmart Dufferin Mall para compras e lembrancinhas canadenses (xarope de bordo/Maple).\nJantar no restaurante Jimmy The Greek.', false),

    -- Quinta 02/04
    (v_trip_id, v_family_id, 'Cataratas do Niágara (Niagara Falls)', '2026-04-02', '08:00:00', 'Niagara Falls, Ontário', 'Saída pontual às 08:00 de carro (aprox. 1h30 de viagem).\nContemplação de uma das maravilhas naturais do mundo.\nAlmoço em Niágara: Hi-Lite Restaurant ou Chip N Charlie''s.', false),
    (v_trip_id, v_family_id, 'Niagara-on-the-Lake e Retorno para Toronto', '2026-04-02', '14:30:00', 'Niagara-on-the-Lake', 'Visita à encantadora cidade histórica de Niagara-on-the-Lake com casinhas vitorianas, vinícolas de Icewine e lojas de doces.\nRetorno para Toronto no fim da tarde.', false),

    -- Sexta 03/04
    (v_trip_id, v_family_id, 'Casa Loma (Castelo de Toronto) e Devolução do Carro', '2026-04-03', '09:00:00', 'Casa Loma, Toronto', 'Café da manhã e passeio nos jardins e exterior do magnífico castelo histórico Casa Loma.\nSaída às 10:15 para devolução do carro na SIXT (chegar no aeroporto YTZ às 11:30).', false),
    (v_trip_id, v_family_id, 'Voo Retorno para Nova York (Toronto → LGA)', '2026-04-03', '14:20:00', 'Aeroporto Billy Bishop (YTZ)', 'Voo AC 8536 às 14:20 com chegada em Nova York LGA às 15:41.\nTransfer de volta para o Airbnb em West New York e jantar tranquilo na região (Sal''s Pizza Bar ou Rotisserie On Park).', false),

    -- Sábado 04/04
    (v_trip_id, v_family_id, 'Dia Inteiro de Compras no The Mills at Jersey Gardens', '2026-04-04', '10:00:00', 'Jersey Gardens Outlet, NJ', 'Dia dedicado às compras de grandes marcas no maior outlet fechado de New Jersey.\n💡 Vantagem de ouro: Isenção total de imposto estadual (Tax Free) sobre roupas e calçados em New Jersey!\nLojas: Nike, Tommy, Ralph Lauren, Calvin Klein, Victoria''s Secret, Apple, etc.', false),

    -- Domingo 05/04
    (v_trip_id, v_family_id, 'Manhã em Manhattan e Deslocamento para o Aeroporto', '2026-04-05', '09:30:00', 'Manhattan / JFK Airport', 'Manhã tranquila para café e últimos passeios.\nSaída com antecedência às 11:30 para o Aeroporto JFK.\nVoo AV 211 às 15:35 para Bogotá.', false),

    -- Segunda 06/04
    (v_trip_id, v_family_id, 'Chegada em Belo Horizonte (Volta para Casa)', '2026-04-06', '10:10:00', 'Aeroporto de Confins (CNF)', 'Chegada no Brasil pelo Rio de Janeiro às 06:15 e pouso final em Belo Horizonte às 10:10 com a família.', false);

  -- 8. Inserir Despesas da Planilha (expenses)
  INSERT INTO public.expenses (trip_id, family_id, description, category, amount, paid, paid_by, spent_on) VALUES
    (v_trip_id, v_family_id, 'Airbnbs New Jersey e Toronto (Hospedagens)', 'hospedagem', 7364.50, true, 'maluki', '2026-03-01'),
    (v_trip_id, v_family_id, 'Passagens Aéreas Brasil → NYC (Avianca)', 'transporte', 3368.10, true, 'maluki', '2026-02-15'),
    (v_trip_id, v_family_id, 'Passagens Aéreas NYC → Toronto (Air Canada)', 'transporte', 4892.50, true, 'maluki', '2026-02-20'),
    (v_trip_id, v_family_id, 'Aluguel do Carro SUV SIXT Toronto (8 dias)', 'transporte', 2163.00, true, 'maluki', '2026-03-05'),
    (v_trip_id, v_family_id, 'Alimentação Família (Estimado U$60/dia x 5.15)', 'alimentacao', 1854.00, false, 'maluki', '2026-03-28'),
    (v_trip_id, v_family_id, 'Transporte Metrô e Ônibus (MetroCard / Presto)', 'transporte', 525.30, false, 'maluki', '2026-03-29'),
    (v_trip_id, v_family_id, 'Gasolina e Pedágios no Canadá e NJ', 'transporte', 515.00, false, 'maluki', '2026-04-01'),
    (v_trip_id, v_family_id, 'Previsão de Compras (Outlets e Lojas)', 'outros', 2575.00, false, 'maluki', '2026-04-04'),
    (v_trip_id, v_family_id, 'Chips de Internet Internacional (eSIM)', 'outros', 10.30, true, 'maluki', '2026-03-20');

  -- 9. Inserir Checklist Completo (checklist_items)
  INSERT INTO public.checklist_items (trip_id, family_id, kind, title, owner_name, done) VALUES
    (v_trip_id, v_family_id, 'preparo', 'Passaportes válidos por no mínimo 6 meses (Alexandre, Matheus, Cristiane)', 'Família', true),
    (v_trip_id, v_family_id, 'preparo', 'Visto Americano B1/B2 válido para entrada nos EUA', 'Família', true),
    (v_trip_id, v_family_id, 'preparo', 'Visto Canadense / eTA (Autorização Eletrônica de Viagem)', 'Família', true),
    (v_trip_id, v_family_id, 'preparo', 'Seguro Viagem Internacional contratado (Pedido nº 5988679)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Habilitar cartões internacionais e configurar conta global (Nomad/Wise)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Levar dólares em espécie (U$ 300)', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Configurar relógio e celular com carteiras digitais (Apple Pay / Google Pay)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Ativar chips eSIM de internet internacional (esim.io / Roamless)', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Instalar aplicativo SpotAngels (Estacionamento livre e vagas em Toronto)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Baixar mapas offline de NYC, Toronto e Niagara no Google Maps', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Imprimir ou salvar QR Codes de passeios e ingressos (CN Tower, Casa Loma)', 'maluki', false),
    (v_trip_id, v_family_id, 'bagagem', 'Mala de mão dentro do limite permitido (< 10 kg)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Cadeados padrão TSA e etiquetas de identificação com telefone e e-mail', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Adaptador de tomada padrão americano (dois pinos chatos)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Power bank (carregador portátil >= 10.000 mAh)', 'maluki', false),
    (v_trip_id, v_family_id, 'bagagem', 'Medicamentos de uso contínuo com laudos e receitas médicas em inglês', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Farmacinha básica (analgésicos, antitérmicos, antialérgico, band-aids)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Casacos corta-vento e agasalhos para a brisa das Cataratas do Niágara', 'Família', false);

  -- 10. Contatos de Emergência
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes) VALUES
    (v_trip_id, v_family_id, 'Seguro Viagem Internacional (Pedido nº 5988679)', '0800-891-3294', 'Assistência médica e emergências. Confirmado para alesauer@gmail.com.'),
    (v_trip_id, v_family_id, 'Locadora SIXT Toronto Downtown', '+1 888 749 8227', 'Suporte à locação do Toyota RAV4 (Reserva: 789661613).'),
    (v_trip_id, v_family_id, 'Airbnb West New York (Mehmet)', '+1 201 423-8926', 'Contato do anfitrião do apartamento em NJ (HM9KZY9FZ8).'),
    (v_trip_id, v_family_id, 'Airbnb Toronto (Willian)', '+1 416-705-4060', 'Contato do anfitrião do apartamento em Toronto (HMCN3ENATY).'),
    (v_trip_id, v_family_id, 'Consulado-Geral do Brasil em Nova York', '+1 917 777-7777', 'Plantão consular de emergência para brasileiros nos EUA.'),
    (v_trip_id, v_family_id, 'Consulado-Geral do Brasil em Toronto', '+1 416 922-2503', 'Plantão consular de emergência para brasileiros no Canadá.');

  RAISE NOTICE 'Viagem Nova York e Toronto atualizada com sucesso!';
END $$;
`;

fs.writeFileSync('docker/nyc-toronto.sql', sql, 'utf8');
console.log('Script docker/nyc-toronto.sql gerado com sucesso!');
