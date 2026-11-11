-- Script de dados iniciais de demonstração (Seed) para Maluki Viagens
-- Cria uma viagem completa com roteiro, reservas, gastos e checklist para a família

DO $$
DECLARE
  v_family_id uuid;
  v_user_id uuid;
  v_trip_id uuid;
  v_res_hotel_id uuid;
BEGIN
  -- 1. Encontrar o usuário e a família de alesauer@gmail.com (ou o primeiro admin disponível)
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
    RAISE NOTICE 'Nenhuma família encontrada para aplicar o seed.';
    RETURN;
  END IF;

  -- 2. Limpar viagens de teste anteriores se existirem com este título
  DELETE FROM public.trips WHERE family_id = v_family_id AND title = 'Férias em Gramado e Canela';

  -- 3. Criar a viagem principal
  INSERT INTO public.trips (
    id,
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
    gen_random_uuid(),
    v_family_id,
    v_user_id,
    'Férias em Gramado e Canela',
    'ferias',
    'confirmada',
    CURRENT_DATE + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '17 days',
    'Gramado, RS',
    'Viagem de inverno em família aproveitando a Serra Gaúcha, parques temáticos e gastronomia típica.',
    7500.00
  ) RETURNING id INTO v_trip_id;

  -- 4. Inserir Roteiro (Activities)
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, estimated_cost, notes, done)
  VALUES 
    (v_trip_id, v_family_id, 'Check-in no Hotel e passeio na Rua Coberta', CURRENT_DATE + INTERVAL '10 days', '15:00:00', 'Rua Coberta, Gramado', 150.00, 'Almoço tardio e caminhada pelo centro histórico.', true),
    (v_trip_id, v_family_id, 'Passeio no Lago Negro e pedalinho', CURRENT_DATE + INTERVAL '11 days', '10:00:00', 'Lago Negro, Gramado', 80.00, 'Levar casaco reforçado pela manhã.', false),
    (v_trip_id, v_family_id, 'Visita ao Mini Mundo', CURRENT_DATE + INTERVAL '12 days', '14:30:00', 'Mini Mundo', 240.00, 'Ingressos já adquiridos com desconto.', false),
    (v_trip_id, v_family_id, 'Parque Snowland (Neve indoor)', CURRENT_DATE + INTERVAL '13 days', '09:30:00', 'Snowland', 450.00, 'Roupa de frio impermeável fornecida pelo parque.', false),
    (v_trip_id, v_family_id, 'Jantar tradicional de Fondue (Noite Suíça)', CURRENT_DATE + INTERVAL '14 days', '20:00:00', 'Restaurante Château dos Plátanos', 380.00, 'Reserva confirmada às 20h.', false);

  -- 5. Inserir Reservas (Reservations)
  INSERT INTO public.reservations (
    id, trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, address
  ) VALUES (
    gen_random_uuid(),
    v_trip_id,
    v_family_id,
    'hospedagem',
    'Hotel Casa da Montanha',
    'Booking.com',
    (CURRENT_DATE + INTERVAL '10 days')::timestamptz + TIME '14:00:00',
    (CURRENT_DATE + INTERVAL '17 days')::timestamptz + TIME '11:00:00',
    'BK-984218',
    3400.00,
    true,
    'Av. Borges de Medeiros, 3166 - Gramado, RS'
  ) RETURNING id INTO v_res_hotel_id;

  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid
  ) VALUES 
    (v_trip_id, v_family_id, 'voo', 'Voo Ida e Volta - Latam', 'Latam Airlines', (CURRENT_DATE + INTERVAL '10 days')::timestamptz + TIME '08:15:00', (CURRENT_DATE + INTERVAL '17 days')::timestamptz + TIME '18:45:00', 'LA-77382B', 2150.00, true),
    (v_trip_id, v_family_id, 'veiculo', 'Aluguel SUV Automático', 'Localiza Rent a Car', (CURRENT_DATE + INTERVAL '10 days')::timestamptz + TIME '11:30:00', (CURRENT_DATE + INTERVAL '17 days')::timestamptz + TIME '16:00:00', 'LOC-44109', 920.00, false);

  -- 6. Inserir Gastos (Expenses)
  INSERT INTO public.expenses (trip_id, family_id, description, category, amount, paid, paid_by, spent_on)
  VALUES 
    (v_trip_id, v_family_id, 'Passagens aéreas família (Latam)', 'transporte', 2150.00, true, 'maluki', CURRENT_DATE - INTERVAL '15 days'),
    (v_trip_id, v_family_id, 'Diárias Hotel Casa da Montanha (Sinal 50%)', 'hospedagem', 1700.00, true, 'maluki', CURRENT_DATE - INTERVAL '10 days'),
    (v_trip_id, v_family_id, 'Ingressos antecipados Mini Mundo', 'passeios', 240.00, true, 'maluki', CURRENT_DATE - INTERVAL '3 days');

  -- 7. Inserir Checklist (Checklist Items)
  INSERT INTO public.checklist_items (trip_id, family_id, kind, title, owner_name, done)
  VALUES 
    (v_trip_id, v_family_id, 'preparo', 'Contratar seguro viagem nacional', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Revisar pneus e bateria do carro de apoio', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Comprar luvas e gorros térmicos', 'Família', true),
    (v_trip_id, v_family_id, 'bagagem', 'Casacos pesados e corta-vento', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Farmacinha básica e receitas', 'Família', true),
    (v_trip_id, v_family_id, 'bagagem', 'Carregadores portáteis e câmeras', 'maluki', false);

  -- 8. Contato de Emergência
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes)
  VALUES (v_trip_id, v_family_id, 'Hospital São Miguel - Gramado', '(54) 3286-1301', 'Pronto atendimento 24h central');

  RAISE NOTICE 'Seed concluído com sucesso para a viagem ID: %', v_trip_id;
END $$;
