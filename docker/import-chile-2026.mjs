// Script de criação da viagem Chile 2026 com base na planilha
import fs from 'fs';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- Criação da viagem Chile 2026
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

  -- 2. Limpar viagem anterior do Chile 2026 se já existir
  DELETE FROM public.trips WHERE family_id = v_family_id AND title = 'Chile 2026';

  -- 3. Inserir a Viagem Chile 2026
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
    'Chile 2026',
    'ferias',
    'confirmada',
    '2026-07-10',
    '2026-07-17',
    'Santiago, Chile',
    'Férias de inverno na neve em Santiago, Cordilheira dos Andes (Farellones), Parque Safari Rancagua, outlets Buenaventura e gastronomia chilena.',
    12000.00
  ) RETURNING id INTO v_trip_id;

  RAISE NOTICE 'Viagem Chile 2026 criada com ID: %', v_trip_id;

  -- 4. Hospedagem (Airbnb Auroras)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, notes, cost, paid
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    'Airbnb Auroras - Centro de Santiago',
    'Airbnb',
    '2026-07-10 15:00:00'::timestamptz,
    '2026-07-17 11:00:00'::timestamptz,
    'Compañía de Jesús 1656, Centro de Santiago, 8380000 Santiago, Chile',
    'Hospedagem no centro histórico de Santiago. Perto do metrô e principais atrações.',
    0,
    false
  );

  -- 5. Voos (Ida e Volta - SKY Airline / Localizador GMGDMM)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, notes, cost, paid
  ) VALUES 
    (
      v_trip_id, v_family_id, 'voo',
      'Voo H2 651 — São Paulo (GRU) → Santiago (SCL)',
      'SKY Airline',
      '2026-07-10 19:15:00'::timestamptz,
      '2026-07-10 23:35:00'::timestamptz,
      'GMGDMM',
      'Saída de Belo Horizonte / São Paulo com destino a Santiago. Chegada às 23:35 e transfer para o Airbnb.',
      0,
      true
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo Retorno — Santiago (SCL) → São Paulo (GRU)',
      'SKY Airline',
      '2026-07-17 13:20:00'::timestamptz,
      '2026-07-17 18:35:00'::timestamptz,
      'GMGDMM',
      'Voo de volta para casa. Saída às 13:20 e chegada às 18:35.',
      0,
      true
    );

  -- 6. Roteiro Dia a Dia (Activities)
  -- Sexta 10/07: Saída e Transfer
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Embarque para Santiago (Voo H2 651)', '2026-07-10', '19:15:00', 'Aeroporto', 'Saída de Belo Horizonte / SP rumo a Santiago. Chegada prevista às 23:35.', false),
    (v_trip_id, v_family_id, 'Transfer do Aeroporto SCL para o Airbnb Auroras', '2026-07-10', '23:45:00', 'Compañía de Jesús 1656, Centro', 'Transfer até o Airbnb no centro histórico e acomodação.', false);

  -- Sábado 11/07: Centro Histórico
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Palácio de La Moneda e Troca de Guarda', '2026-07-11', '09:30:00', 'Palácio de La Moneda', 'Sede da presidência do Chile, palco do bombardeio de 1973.\n\n💡 Dica de Ouro: Tente alinhar o horário para assistir à tradicional Troca de Guarda pela manhã.\nArredores: Centro Cultural La Moneda (subsolo), Plaza de la Constitución e Paseo Ahumada.\nRestaurantes: Las Vacas Gordas (Carnes), Café Cité, Wonderland Café (Alice no País das Maravilhas).\nMaps: https://maps.app.goo.gl/61Dbj276QD6Kyssw9', false),
    (v_trip_id, v_family_id, 'Plaza de Armas e Catedral Metropolitana', '2026-07-11', '12:00:00', 'Plaza de Armas', 'Coração histórico e marco zero de Santiago, cercado por prédios coloniais.\n\n💡 Dica de Ouro: Entre na Catedral Metropolitana; arquitetura interna belíssima e gratuita. Atenção com carteira e celular no entorno.\nArredores: Museu Histórico Nacional e Correio Central.', false),
    (v_trip_id, v_family_id, 'Barrio Lastarria e Cerro Santa Lucía', '2026-07-11', '15:30:00', 'Barrio Lastarria', 'Bairro charmoso com forte pegada cultural, cafés modernos e ruelas de paralelepípedo.\n\n💡 Dica de Ouro: Excelente parada para almoço ou café no meio da tarde. Caminhe sem pressa pela rua José Victorino Lastarria.\nArredores: Mirante do Cerro Santa Lucía, GAM e Parque Forestal.', false);

  -- Domingo 12/07: Natureza, Charme Europeu e Modernidade
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Cerro San Cristóbal e Funicular', '2026-07-12', '09:30:00', 'Cerro San Cristóbal', 'Segunda montanha mais alta de Santiago, subida imperdível no histórico bondinho funicular.\n\n💡 Dica de Ouro: No topo, não deixe de provar o Mote con Huesillos (bebida doce típica chilena com pêssego e trigo).\nArredores: Santuário no topo, teleférico e entrada pelo Barrio Bellavista.\nMaps: https://maps.app.goo.gl/MDcj7wMjbm7Zn41j6', false),
    (v_trip_id, v_family_id, 'Almoço no Patio Bellavista', '2026-07-12', '12:30:00', 'Patio Bellavista', 'Shopping gastronômico aberto, moderno e seguro, repleto de ótimas opções internacionais.\nRestaurantes: Backstage Life (música ao vivo e grelhados).', false),
    (v_trip_id, v_family_id, 'Vila Le Ville (General Holley)', '2026-07-12', '15:00:00', 'General Holley, Providencia', 'Charmosa vila de pedestres com arquitetura em estilo Tudor europeu, cafés aconchegantes e clima tranquilo.\n\n💡 Dica de Ouro: Perfeito para tomar um bom café expresso ou chocolate quente.', false),
    (v_trip_id, v_family_id, 'Pôr do Sol no Sky Costanera (61º andar)', '2026-07-12', '16:45:00', 'Costanera Center', 'Mirante do prédio mais alto da América Latina com vista 360° surreal.\n\n💡 Dica de Ouro: Subir cerca de 1 hora antes do pôr do sol. A transição com as luzes da cidade e a Cordilheira ao fundo é cinematográfica.', false),
    (v_trip_id, v_family_id, 'Jantar no Mercado MUT (Mercado Urbano Tobalaba)', '2026-07-12', '19:30:00', 'MUT - Tobalaba', 'Primeiro mercado urbano sustentável do Chile, complexo moderníssimo com jardins e polo gastronômico.\n\n💡 Dica de Ouro: Pizzarias artesanais estilo italiano, hamburguerias premium e ótimos vinhos.', false);

  -- Segunda 13/07: Safari Rancagua
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Passeio Parque Safari Rancagua (Leões e Herbívoros)', '2026-07-13', '08:30:00', 'Ruta H 30, Rancagua', 'Uma das experiências mais emocionantes com animais selvagens resgatados em áreas abertas e seguras.\n\nIncluso no Tour: Transporte, seguro passageiro, guia bilíngue, grandes felinos e herbívoros.\n\n💡 Levar: Óculos escuros, roupas confortáveis, protetor solar e água.\nMaps: https://maps.app.goo.gl/GkzttzyCsh3Ejx3j7', false);

  -- Terça 14/07: Outlets e Compras
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Compras no Arauco Premium Outlet Buenaventura & Easton Outlet', '2026-07-14', '10:00:00', 'San Ignacio 500, Quilicura', 'Maior complexo de outlets do Chile com mais de 150 marcas: Nike, Adidas, The North Face, Columbia, Puma, Under Armour, Levi''s, Carolina Herrera, Hugo Boss.\n\n💡 Dicas de Ouro:\n- Visite na terça-feira pela manhã (10h) para encontrar o estoque completo e sem filas.\n- Combine com o Easton Outlet Mall logo ao lado.\n- Foco em casacos de inverno (The North Face, Columbia) e itens esportivos.\n- Pagar com conta global (Nomad/Wise) para evitar IOF alto.\n- Vá de Uber/transporte privado.\nMaps: https://maps.app.goo.gl/ppB5TMt8NgJMsyzG8', false);

  -- Quarta 15/07: Cordilheira dos Andes e Neve em Farellones
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Dia na Neve no Parque Farellones (Cordilheira dos Andes)', '2026-07-15', '07:30:00', 'Farellones, Andes', 'Vila de montanha e parque de neve com tubing, tirolesa canopy, cadeira panorâmica, trenó e aulas de esqui/snowboard.\n\n💡 Dicas Essenciais:\n- Chegue cedo com ingresso antecipado comprado.\n- Roupas e botas impermeáveis para neve, luvas, óculos escuros e protetor solar.\n- Priorize o Tubing no início do dia por ser o mais concorrido.\n- Suba com van/agência especializada (40 curvas na neve).\n- Tome remédio para enjoo antes de subir.\nRestaurantes: El Montañés, El Alemán de Farellones, Posada Farellones.', false);

  -- Quinta 16/07: Dia Livre e Gastronomia
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Templo Bahá''í e Bairro Itália', '2026-07-16', '10:00:00', 'Peñalolén / Providencia', 'Arquitetura premiada na pré-cordilheira com vista panorâmica da cidade e polo de galerias e casarões históricos no Bairro Itália.\nRestaurantes sugeridos: Mestizo, La Cabrera ou Las Vacas Gordas.', false),
    (v_trip_id, v_family_id, 'Parque Bicentenário ou Vinícola Cousiño Macul', '2026-07-16', '15:00:00', 'Vitacura / Peñalolén', 'Passeio pelas lagoas de flamingos no Parque Bicentenário ou tour com degustação nas caves centenárias da Cousiño Macul (acesso pelo metrô Quilín).', false),
    (v_trip_id, v_family_id, 'Jantar Especial de Despedida (Parrillada Chilena/Argentina)', '2026-07-16', '20:00:00', 'La Cabrera ou Las Vacas Gordas', 'Jantar de despedida em restaurante tradicional de cortes nobres na brasa.', false);

  -- Sexta 17/07: Retorno
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, 'Check-out Airbnb e Transfer para Aeroporto SCL', '2026-07-17', '10:00:00', 'Airbnb Auroras', 'Organização de malas, check-out e deslocamento com antecedência para o Aeroporto Internacional Arturo Merino Benítez (SCL).', false),
    (v_trip_id, v_family_id, 'Embarque Voo Retorno para o Brasil', '2026-07-17', '13:20:00', 'Aeroporto SCL', 'Voo de retorno para o Brasil (chegada prevista às 18:35).', false);

  -- 7. Checklist Completo Baseado na Planilha
  INSERT INTO public.checklist_items (trip_id, family_id, kind, title, owner_name, done) VALUES
    (v_trip_id, v_family_id, 'preparo', 'Passaporte válido por no mínimo 6 meses (ou RG em perfeito estado)', 'Família', true),
    (v_trip_id, v_family_id, 'preparo', 'Seguro Viagem internacional ativo (Mastercard Black / AIG)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Habilitar cartões para uso internacional e configurar conta global (Nomad/Wise)', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Levar dinheiro em espécie (pesos chilenos / dólares para emergência)', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Comprar ingressos antecipados para Parque Farellones (Tubing)', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Reservar transfer/agência para o dia de Farellones (evitar dirigir nas 40 curvas)', 'Família', false),
    (v_trip_id, v_family_id, 'preparo', 'Reservar ingressos/tour do Parque Safari Rancagua', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Baixar mapas offline de Santiago e Farellones no Google Maps', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Configurar chip internacional / eSIM de dados para o Chile', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Salvar comprovantes de hospedagem (Airbnb Auroras) e voos offline', 'maluki', true),
    (v_trip_id, v_family_id, 'bagagem', 'Roupas térmicas / segunda pele (calça e blusa) para o frio dos Andes', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Casacos e calças impermeáveis próprios para neve', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Botas impermeáveis com solado aderente para neve e gelo', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Luvas impermeáveis, gorros, cachecóis e protetor de orelha', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Óculos escuros (essencial pelo reflexo do sol na neve branca)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Protetor solar e protetor labial hidratante para o clima seco e neve', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Remédio para enjoo (Dramin/Vonau para as curvas da montanha)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Farmacinha básica (analgésicos, antitérmicos, descongestionante nasal)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Power bank (carregador portátil - frio descarrega bateria rápido)', 'maluki', false),
    (v_trip_id, v_family_id, 'bagagem', 'Adaptador de tomada tipo C/L compatível com o Chile', 'maluki', false),
    (v_trip_id, v_family_id, 'bagagem', 'Mala dentro do limite de peso permitido (<10kg de mão)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Cadeados TSA e etiquetas de identificação de bagagem', 'Família', false);

  -- 8. Contatos de Emergência
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes) VALUES
    (v_trip_id, v_family_id, 'Seguro Viagem Mastercard Black (Assistência)', '0800-891-3294', 'Acionar antes de qualquer consulta ou atendimento médico.'),
    (v_trip_id, v_family_id, 'Consulado-Geral do Brasil em Santiago', '+56 2 2840 8500', 'Apoio a cidadãos brasileiros em emergências no Chile.'),
    (v_trip_id, v_family_id, 'Carabineros de Chile (Polícia de Emergência)', '133', 'Número nacional de emergência policial no Chile.'),
    (v_trip_id, v_family_id, 'Ambulância / SAMU Chile', '131', 'Atendimento móvel de urgência médica.');

  RAISE NOTICE 'Chile 2026 criado com sucesso com roteiro, reservas, checklist e contatos!';
END $$;
`;

fs.writeFileSync('docker/chile-2026.sql', sql, 'utf8');
console.log('Script docker/chile-2026.sql gerado com sucesso!');

