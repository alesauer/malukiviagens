-- Script de importação gerado automaticamente para Maluki Viagens
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
    'Santa Cruz de la Sierra',
    'ferias',
    'confirmada',
    '2027-03-24',
    '2027-03-31',
    'Santa Cruz de la Sierra, Bolívia',
    '6 dias e 5 noites em Santa Cruz | Viajantes: 2 adultos e 1 adolescente (15 anos) | Estilo: Turismo, Compras, Gastronomia, Cultura, Natureza',
    5500.00
  ) RETURNING id INTO v_trip_id;

  RAISE NOTICE 'Viagem atual inserida com ID: %', v_trip_id;

  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, address, maps_url, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Airport Hotel Gru (Guarulhos)',
    'Booking.com',
    '2027-03-24 13:30:00'::timestamptz,
    '2027-03-25 11:30:00'::timestamptz,
    '6950.868.242',
    489,
    false,
    'Av. Otávio Braga de Mesquita, 3055, Guarulhos, 07191-000, Brasil',
    'https://www.google.com/maps/search/?api=1&query=Airport+Hotel+Gru,+Av.+Ot%C3%A1vio+Braga+de+Mesquita+3055,+Guarulhos',
    'Quarto: Quarto Família Standard
Refeição: Café da manhã incluso
PIN: 6109
Telefone: +55 11 93280 8454
Janela de check-in: 13:30 às 14:00. Janela de check-out: 11:30 às 12:00.
Estadia para dormir antes do voo das 09:00 de GRU para Santa Cruz.
Estacionamento próximo ao hotel: R$ 35,00 por dia (sob reserva).'
  );
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, address, maps_url, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Hotel By Armonía (Santa Cruz de la Sierra)',
    'Booking.com',
    '2027-03-25 14:00:00'::timestamptz,
    '2027-03-30 12:30:00'::timestamptz,
    '5354.777.647',
    1749,
    false,
    'Avenida Guapay, Calle Armonía #96, Santa Cruz de la Sierra, Bolívia',
    'https://www.google.com/maps/search/?api=1&query=Hotel+By+Armon%C3%ADa,+Santa+Cruz+de+la+Sierra,+Bolivia',
    'Quarto: Quarto com 2 camas de solteiro
Refeição: Café da manhã incluso
PIN: 0783
Telefone: +591 3 3464699
Wi-Fi e estacionamento gratuitos.
O quarto tem 2 camas de solteiro para 3 hóspedes: confirme com o hotel a cama extra, que não está incluída no valor.
O voo de volta sai às 12:05, antes do horário limite de check-out: faça o check-out cedo.
Coordenadas: 17°46,651'' S, 63°9,379'' O.'
  );
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, address, maps_url, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Airport Hotel Gru (Guarulhos)',
    'Booking.com',
    '2027-03-30 13:30:00'::timestamptz,
    '2027-03-31 11:30:00'::timestamptz,
    '5123.871.526',
    489,
    false,
    'Av. Otávio Braga de Mesquita, 3055, Guarulhos, 07191-000, Brasil',
    'https://www.google.com/maps/search/?api=1&query=Airport+Hotel+Gru,+Av.+Ot%C3%A1vio+Braga+de+Mesquita+3055,+Guarulhos',
    'Quarto: Quarto Família Standard
Refeição: Café da manhã incluso
PIN: 9268
Telefone: +55 11 93280 8454
Janela de check-in: 13:30 às 14:00. Janela de check-out: 11:30 às 12:00.
O voo de Santa Cruz chega em GRU às 15:55; no dia seguinte o voo para BH sai de Congonhas (CGH) às 14:00.'
  );
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'voo',
    'Voo LA 3047 (CNF → CGH)',
    'LATAM Airlines',
    '2027-03-24 20:25:00'::timestamptz,
    '2027-03-24 21:40:00'::timestamptz,
    'EMBZQH',
    0,
    true,
    'Belo Horizonte (Confins) → São Paulo (Congonhas)
Tarifa: Economy Light
Bagagem: 1 item pessoal (até 10 kg) e 1 bagagem de mão (até 12 kg). Sem bagagem despachada.
Bilhete: 957 2309538502 / 03 / 04
Pago com milhas LATAM Pass (27.938 por passageiro) e taxas no cartão. Remarcação com multa de R$ 196,90.'
  );
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'voo',
    'Voo G3 7638 (GRU → VVI)',
    'GOL',
    '2027-03-25 09:00:00'::timestamptz,
    '2027-03-25 11:05:00'::timestamptz,
    'ATMTZO',
    0,
    true,
    'São Paulo (Guarulhos) → Santa Cruz (Viru Viru)
Tarifa: Light
Bilhete: 127 2315244407
O horário de chegada em Santa Cruz é local (1h a menos que Brasília). Voo internacional: chegue com antecedência.'
  );
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'voo',
    'Voo G3 7639 (VVI → GRU)',
    'GOL',
    '2027-03-30 12:05:00'::timestamptz,
    '2027-03-30 15:55:00'::timestamptz,
    'ATMTZO',
    0,
    true,
    'Santa Cruz (Viru Viru) → São Paulo (Guarulhos)
Tarifa: Light
Bilhete: 127 2315244407
O horário de saída de Santa Cruz é local (1h a menos que Brasília).'
  );
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'voo',
    'Voo LA 4642 (CGH → CNF)',
    'LATAM Airlines',
    '2027-03-31 14:00:00'::timestamptz,
    '2027-03-31 15:05:00'::timestamptz,
    'EMBZQH',
    0,
    true,
    'São Paulo (Congonhas) → Belo Horizonte (Confins)
Tarifa: Economy Light
Bagagem: 1 item pessoal (até 10 kg) e 1 bagagem de mão (até 12 kg). Sem bagagem despachada.
Bilhete: 957 2309538502 / 03 / 04
O voo anterior chega em Guarulhos (GRU) e este sai de Congonhas (CGH): o transporte entre aeroportos é por conta do passageiro.'
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Voo LA 3047 — Confins → Congonhas',
    '2027-03-24',
    NULL,
    'Voo LA 3047 — Confins → Congonhas',
    0,
    'Saída às 20:25 e chegada às 21:40. Tarifa Economy Light, somente bagagem de mão.

💡 Dica: Congonhas e Guarulhos são aeroportos diferentes: planeje o transporte até o hotel.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Airport Hotel Gru',
    '2027-03-24',
    NULL,
    'Airport Hotel Gru',
    0,
    'Check-in a partir das 13:30 (reserva 6950.868.242, PIN 6109). Noite em Guarulhos antes do voo das 09:00.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Voo G3 7638 — Guarulhos → Viru Viru',
    '2027-03-25',
    '09:00:00'::time,
    'Voo G3 7638 — Guarulhos → Viru Viru',
    0,
    'Saída às 09:00 e chegada às 11:05 (horário local). Voo direto de 3h05.

💡 Dica: Chegue ao aeroporto com antecedência: é voo internacional.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Check-in — Hotel By Armonía',
    '2027-03-25',
    '14:00:00'::time,
    'Check-in — Hotel By Armonía',
    0,
    'Deslocamento do aeroporto, check-in e acomodação (reserva 5354.777.647, PIN 0783). Café da manhã incluso.

💡 Dica: O pagamento é feito no hotel, em dólares. Confirme a cama extra para o terceiro hóspede.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Plaza 24 de Septiembre',
    '2027-03-25',
    NULL,
    'Plaza 24 de Septiembre',
    0,
    'Conhecer a principal praça da cidade, observar a arquitetura, os cafés e o movimento local.

Maps: https://www.google.com/maps/search/?api=1&query=Plaza%2024%20de%20Septiembre%2C%20Centro%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Catedral Metropolitana de San Lorenzo',
    '2027-03-25',
    NULL,
    'Catedral Metropolitana de San Lorenzo',
    0,
    'Visitar a principal catedral de Santa Cruz e conhecer sua arquitetura e importância histórica.

Maps: https://www.google.com/maps/search/?api=1&query=Catedral%20Metropolitana%20de%20San%20Lorenzo%2C%20Plaza%2024%20de%20Septiembre%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Centro Histórico',
    '2027-03-25',
    NULL,
    'Centro Histórico',
    0,
    'Caminhada pelas ruas centrais e jantar em restaurante de gastronomia boliviana.

🍽️ Restaurantes: Perto da Catedral: Resto-Bar Punto Mágico (temático) e El Bosque de las Hadas.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Cristo Redentor',
    '2027-03-26',
    NULL,
    'Cristo Redentor',
    0,
    'Conhecer um dos monumentos mais conhecidos de Santa Cruz e aproveitar para fotografar a região.

Maps: https://www.google.com/maps/search/?api=1&query=Cristo%20Redentor%2C%20Avenida%20Monse%C3%B1or%20Rivero%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Centro de Santa Cruz',
    '2027-03-26',
    NULL,
    'Centro de Santa Cruz',
    0,
    'Explorar ruas, praças e pontos de interesse cultural da cidade.

Arredores: Casa Cultural Melchor Pinto, Manzana Uno e Parque El Arenal.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Restaurante de gastronomia regional',
    '2027-03-26',
    NULL,
    'Restaurante de gastronomia regional',
    0,
    'Experimentar pratos típicos da região de Santa Cruz, como majadito, locro e sonso.

🍽️ Restaurantes: La Casa del Camba — majadito, pacumutu e parrilla.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Equipetrol',
    '2027-03-26',
    NULL,
    'Equipetrol',
    0,
    'Conhecer a região moderna da cidade, suas avenidas, cafés e estabelecimentos comerciais.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Jantar em Equipetrol',
    '2027-03-26',
    NULL,
    'Jantar em Equipetrol',
    0,
    'Jantar em restaurante temático ou especializado em carnes.

🍽️ Restaurantes: El Arriero (parrilla, Av. San Martín) ou Aviator Wings & Beer (temático de aviação).',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Saída de Santa Cruz de la Sierra',
    '2027-03-27',
    '07:00:00'::time,
    'Saída de Santa Cruz de la Sierra',
    0,
    'Saída para a excursão em direção a Samaipata.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'El Fuerte de Samaipata',
    '2027-03-27',
    NULL,
    'El Fuerte de Samaipata',
    0,
    'Visitar o sítio arqueológico pré-colombiano reconhecido como Patrimônio Mundial da UNESCO. Conhecer as estruturas arqueológicas e as enormes esculturas e gravuras na rocha.

Maps: https://www.google.com/maps/search/?api=1&query=El+Fuerte+de+Samaipata,+Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Centro de Samaipata',
    '2027-03-27',
    NULL,
    'Centro de Samaipata',
    0,
    'Experimentar a gastronomia local e conhecer o pequeno povoado.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Centro histórico de Samaipata',
    '2027-03-27',
    NULL,
    'Centro histórico de Samaipata',
    0,
    'Caminhar pelas ruas, conhecer as construções locais, lojas de artesanato e aproveitar as paisagens da região.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Retorno a Santa Cruz',
    '2027-03-27',
    NULL,
    'Retorno a Santa Cruz',
    0,
    'Deslocamento de volta para a hospedagem.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Biocentro Güembé',
    '2027-03-28',
    '09:00:00'::time,
    'Biocentro Güembé',
    0,
    'Visitar um complexo de natureza e lazer com jardins tropicais, borboletário, orquidário, aves e áreas verdes.

💡 Dica: Levar repelente, protetor solar e roupa de banho.

Maps: https://www.google.com/maps/search/?api=1&query=Biocentro%20Guembe%2C%20Camino%20a%20Porongo%20Km%205%2C%20Urubo%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Borboletário e Orquidário',
    '2027-03-28',
    NULL,
    'Borboletário e Orquidário',
    0,
    'Conhecer os ambientes naturais e observar espécies de borboletas, aves e plantas.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Restaurante do complexo',
    '2027-03-28',
    NULL,
    'Restaurante do complexo',
    0,
    'Fazer uma refeição no próprio complexo ou em estabelecimento próximo.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Áreas de lazer do Biocentro Güembé',
    '2027-03-28',
    NULL,
    'Áreas de lazer do Biocentro Güembé',
    0,
    'Aproveitar piscinas, jardins, trilhas e demais atividades disponíveis.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Equipetrol',
    '2027-03-28',
    NULL,
    'Equipetrol',
    0,
    'Retorno à hospedagem e jantar tranquilo.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Mercado Mutualista',
    '2027-03-29',
    NULL,
    'Mercado Mutualista',
    0,
    'Conhecer um mercado popular, observar produtos locais, artesanato e o cotidiano da cidade.

Maps: https://www.google.com/maps/search/?api=1&query=Mercado%20Mutualista%2C%20Santa%20Cruz%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Mercado Los Pozos',
    '2027-03-29',
    NULL,
    'Mercado Los Pozos',
    0,
    'Explorar o comércio popular e conhecer produtos e artigos regionais.

Maps: https://www.google.com/maps/search/?api=1&query=Mercado%20Los%20Pozos%2C%20Santa%20Cruz%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Restaurante escolhido pela família',
    '2027-03-29',
    NULL,
    'Restaurante escolhido pela família',
    0,
    'Almoço em restaurante de carnes, pizzaria ou gastronomia internacional.

🍽️ Restaurantes: Vaca Morena, Noi Pizzeria ou Brasargent Churrasquería.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Ventura Mall',
    '2027-03-29',
    NULL,
    'Ventura Mall',
    0,
    'Passear pelo shopping, conhecer lojas, comprar lembranças e aproveitar as opções de entretenimento.

Maps: https://www.google.com/maps/search/?api=1&query=Ventura%20Mall%2C%20Avenida%20San%20Mart%C3%ADn%2C%20Equipetrol%20Norte%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Jantar de despedida',
    '2027-03-29',
    NULL,
    'Jantar de despedida',
    0,
    'Jantar especial de despedida em restaurante temático ou italiano em Equipetrol.

🍽️ Restaurantes: Jardín de Asia (Green Tower), In Piazza ou Michelangelo Ristorante.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Café da manhã e check-out — Hotel By Armonía',
    '2027-03-30',
    NULL,
    'Café da manhã e check-out — Hotel By Armonía',
    0,
    'Café da manhã, organização das malas e check-out. O limite é 12:30, mas o voo sai antes.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Compras de última hora',
    '2027-03-30',
    NULL,
    'Compras de última hora',
    0,
    'Caso exista tempo disponível, fazer compras de última hora ou tomar um café.

💡 Dica: O tempo é curto: para um voo internacional às 12:05, o ideal é estar em Viru Viru por volta das 09:30.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Aeroporto Internacional Viru Viru',
    '2027-03-30',
    NULL,
    'Aeroporto Internacional Viru Viru',
    0,
    'Deslocamento para o aeroporto e embarque de retorno.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Voo G3 7639 — Viru Viru → Guarulhos',
    '2027-03-30',
    '12:05:00'::time,
    'Voo G3 7639 — Viru Viru → Guarulhos',
    0,
    'Saída às 12:05 (horário local) e chegada às 15:55. Voo direto de 2h50.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Airport Hotel Gru',
    '2027-03-30',
    NULL,
    'Airport Hotel Gru',
    0,
    'Check-in a partir das 13:30 (reserva 5123.871.526, PIN 9268). Noite em Guarulhos.',
    false
  );
  INSERT INTO public.activities (
    trip_id, family_id, title, date, time, location, estimated_cost, notes, done
  ) VALUES (
    v_trip_id, v_family_id,
    'Voo LA 4642 — Congonhas → Confins',
    '2027-03-31',
    NULL,
    'Voo LA 4642 — Congonhas → Confins',
    0,
    'Saída às 14:00 e chegada às 15:05.

💡 Dica: O voo sai de Congonhas (CGH), não de Guarulhos: reserve o deslocamento entre aeroportos com folga.',
    false
  );
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
    VALUES (v_trip_id, v_family_id, 'MasterAssist / Seguro Viagem (Brasil)', '0800-891-3294', 'Em emergência médica, acione ANTES de qualquer atendimento. E-mail: bue_operadores_brasil@axa-assistance.com.ar — Site: www.mycardbenefits.com');
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
    VALUES (v_trip_id, v_family_id, 'MasterAssist (Internacional a Cobrar)', '+1-636-722-8882', 'Em emergência médica, acione ANTES de qualquer atendimento. E-mail: bue_operadores_brasil@axa-assistance.com.ar — Site: www.mycardbenefits.com');
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
    VALUES (v_trip_id, v_family_id, 'SAC AIG Seguros 24h', '0800 726 6130', 'SAC AIG 24h: 0800 726 6130 | Ouvidoria AIG: 0800 724 0219 | SUSEP: 0800 021 8484');
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Beto Carrero / B. Camboriú',
    'ferias',
    'realizada',
    '2018-07-16',
    '2021-07-24',
    'Camboriú, Blumenau, Penha, Beto Carrero',
    'Com: Maluki | Planejamento: https://bit.ly/3YDQJRk | Período: 16 de julho de 2018 → 24 de julho de 2021',
    'https://photos.app.goo.gl/2rNm76juMA4a9uVh9'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Rio de Janeiro',
    'ferias',
    'realizada',
    '2023-01-10',
    '2023-01-16',
    'Rio de Janeiro / Hospedagem na Barra',
    'Com: Maluki + Jojoca e Lilica | Período: 10 de janeiro de 2023 → 16 de janeiro de 2023',
    'https://photos.app.goo.gl/TetUSMJuHYiCiW527'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Foz do Iguaçu / Londrina',
    'ferias',
    'realizada',
    '2020-01-20',
    '2020-01-26',
    'Foz do Iguaçu, Londrina',
    'Com: Maluki + Jojoca e Lilica | Período: 20 de janeiro de 2020 → 26 de janeiro de 2020',
    'https://photos.app.goo.gl/fVHipzNiMF4cfsRf9'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Orlando',
    'ferias',
    'realizada',
    '2019-01-11',
    '2019-01-31',
    'Orlando, Miami',
    'Com: Maluki | Período: 11 de janeiro de 2019 → 31 de janeiro de 2019',
    'https://photos.app.goo.gl/XTdwd13Asb2B1uez6'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'São Paulo / Consulado',
    'ferias',
    'realizada',
    '2018-04-12',
    '2018-04-15',
    'São Paulo',
    'Com: Maluki | Período: 12 de abril de 2018 → 15 de abril de 2018',
    'https://photos.app.goo.gl/ctPIKQPDZozHAvFo1'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Americana',
    'ferias',
    'realizada',
    '2017-11-02',
    '2017-11-05',
    'Americana (West''n Wild)',
    'Com: Maluki + Jojoca e Lilica | Período: 2 de novembro de 2017 → 5 de novembro de 2017',
    'https://photos.app.goo.gl/T5aDp6mXwRv76MZP2'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Chile',
    'ferias',
    'realizada',
    '2017-07-17',
    '2017-07-24',
    'Santiago, Vale Nevado, Valparaíso, Andes',
    'Com: Maluki | Planejamento: https://bit.ly/3s8EG21 | Período: 17 de julho de 2017 → 24 de julho de 2017',
    'https://photos.app.goo.gl/xw3TGlcS2bipja8R2'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Gramado',
    'ferias',
    'realizada',
    '2016-09-18',
    '2016-09-24',
    'Gramado, Canela',
    'Com: Maluki | Planejamento: https://bit.ly/45nFmyM | Período: 18 de setembro de 2016 → 24 de setembro de 2016',
    'https://photos.app.goo.gl/ZfxsSUvhMjBttCU27'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Porto Alegre',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Porto Alegre',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Beto Carrero / Curitiba',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Beto Carrero / Curitiba',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Orlando / Disney',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Orlando / Disney',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Argentina',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Argentina',
    NULL,
    'https://photos.app.goo.gl/BtN1nZivJv29wqrJ6'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Rio de Janeiro',
    'ferias',
    'realizada',
    '2020-10-30',
    '2020-11-02',
    'Rio de Janeiro / Barra / Hotel Windsor',
    'Com: Maluki | Período: 30 de outubro de 2020 → 2 de novembro de 2020',
    'https://photos.app.goo.gl/P9DxXwnaGmXuyFDS9'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Maceió / Maragogi',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Maceió / Maragogi',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Cabo Frio',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Cabo Frio',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Aparecida / Paraty',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Aparecida / Paraty',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Campos do Jordão',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Campos do Jordão',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Porto Alegre / Fisl',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Porto Alegre / Fisl',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Porto Seguro',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Porto Seguro',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Tauá',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Tauá',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Monte Verde',
    'ferias',
    'realizada',
    '2018-01-10',
    '2018-01-15',
    'Monte Verde',
    NULL,
    NULL
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Nova York',
    'ferias',
    'realizada',
    '2023-10-10',
    '2023-10-15',
    'Nova York',
    'Com: Maluki | Período: 10 de outubro de 2023',
    'https://photos.app.goo.gl/L5v3kD98kxCK3GQ6A'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'São Paulo — Fev/24',
    'ferias',
    'realizada',
    '2024-02-11',
    '2024-02-16',
    'São Paulo',
    'Com: Maluki + Jojoca e Lilica | Período: 11 de fevereiro de 2024',
    'https://photos.app.goo.gl/6pc9x9MhcFHGrvoF6'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Europa',
    'ferias',
    'realizada',
    '2025-10-10',
    '2025-10-15',
    'Amsterdã, Paris, Londres',
    'Com: Maluki | Período: 10 de outubro de 2025',
    'https://photos.app.goo.gl/cWdCnHS6REDcm85m9'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Espírito Santo',
    'ferias',
    'realizada',
    '2023-10-10',
    '2023-10-15',
    'Guarapari',
    'Com: Maluki e Pais | Período: 10 de outubro de 2023',
    'https://photos.app.goo.gl/VQ31UZQ7cVnyvhPx5'
  );
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
    photos_url
  ) VALUES (
    v_family_id,
    v_user_id,
    'Nova York e Toronto',
    'ferias',
    'realizada',
    '2026-03-26',
    '2026-03-31',
    'Nova York, Toronto, Niágara',
    'Com: Maluki | Período: 26 de março de 2026',
    'https://photos.app.goo.gl/L5v3kD98kxCK3GQ6A'
  );

  RAISE NOTICE 'Importação concluída com sucesso!';
END $$;
