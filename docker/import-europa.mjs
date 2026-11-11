import fs from 'fs';

let sql = `-- Atualização completa da viagem Europa: França, Inglaterra e Holanda
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

  -- 2. Localizar viagem existente de Europa ou criar
  SELECT id INTO v_trip_id 
  FROM public.trips 
  WHERE family_id = v_family_id AND (title ILIKE '%Europa%')
  LIMIT 1;

  IF v_trip_id IS NULL THEN
    INSERT INTO public.trips (
      family_id, created_by, title, category, status, start_date, end_date, main_destination, description, budget
    ) VALUES (
      v_family_id, v_user_id, 'Europa: França, Inglaterra e Holanda', 'ferias', 'confirmada', '2025-10-09', '2025-10-21',
      'França (Paris), Inglaterra (Londres) e Holanda (Amsterdã)',
      'Roteiro clássico europeu em família por trem de alta velocidade (Eurostar): Paris (Torre Eiffel, Louvre e Disney), Londres (London Eye, Oxford Street e Camden) e Amsterdã (Canais e Anne Frank).',
      47100.00
    ) RETURNING id INTO v_trip_id;
  ELSE
    UPDATE public.trips SET
      title = 'Europa: França, Inglaterra e Holanda',
      category = 'ferias',
      status = 'confirmada',
      start_date = '2025-10-09',
      end_date = '2025-10-21',
      main_destination = 'França (Paris), Inglaterra (Londres) e Holanda (Amsterdã)',
      description = 'Roteiro clássico europeu em família por trem de alta velocidade (Eurostar): Paris (Torre Eiffel, Louvre e Disney), Londres (London Eye, Oxford Street e Camden) e Amsterdã (Canais e Anne Frank).',
      budget = 47100.00
    WHERE id = v_trip_id;
  END IF;

  RAISE NOTICE 'Atualizando viagem ID: %', v_trip_id;

  -- 3. Limpar registros dependentes anteriores
  DELETE FROM public.activities WHERE trip_id = v_trip_id;
  DELETE FROM public.reservations WHERE trip_id = v_trip_id;
  DELETE FROM public.expenses WHERE trip_id = v_trip_id;
  DELETE FROM public.checklist_items WHERE trip_id = v_trip_id;
  DELETE FROM public.emergency_contacts WHERE trip_id = v_trip_id;

  -- 4. Inserir Hospedagens (3 Países: França, Inglaterra, Holanda)
  -- 4.1 França: Paris
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    '🇫🇷 ibis Paris Place d’Italie 13ème (Paris)',
    'Accor / Booking',
    '2025-10-10 14:00:00'::timestamptz,
    '2025-10-14 11:00:00'::timestamptz,
    '25 Avenue Stephen Pichon, 13º arr., 75013 Paris, França',
    5577.00,
    true,
    '4 diárias (€ 858). Café da manhã incluso. Cancelamento grátis até 09/10/2025. Excelente acesso ao metrô linha 6 para Torre Eiffel.'
  );

  -- 4.2 Inglaterra: Londres
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    '🇬🇧 Zedwell Piccadilly Circus (Londres)',
    'Booking / Hotel',
    '2025-10-14 14:00:00'::timestamptz,
    '2025-10-17 11:00:00'::timestamptz,
    'Great Windmill Street, Piccadilly Circus, Westminster Borough, Londres, Reino Unido',
    3637.40,
    true,
    '3 diárias (€ 559,60). Localização no coração de Londres, pertinho da London Eye, Leicester Square e Chinatown.'
  );

  -- 4.3 Holanda: Amsterdã
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, address, cost, paid, notes
  ) VALUES (
    v_trip_id, v_family_id, 'hospedagem',
    '🇳🇱 Leonardo Royal Hotel Amsterdam (Amsterdã)',
    'Booking / Hotel',
    '2025-10-17 15:00:00'::timestamptz,
    '2025-10-20 11:00:00'::timestamptz,
    'Paul van Vlissingenstraat 24, Oost, 1096 BK Amsterdã, Holanda',
    5965.90,
    true,
    '3 diárias (€ 917,83). Café da manhã incluso. Conexão rápida para o centro histórico e canais.'
  );

  -- 5. Inserir Trens entre os Países (Eurostar)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES 
    (
      v_trip_id, v_family_id, 'outro',
      '🚆 Trem Eurostar: Paris (Gare du Nord) → Londres (St. Pancras)',
      'Eurostar',
      '2025-10-14 09:00:00'::timestamptz,
      '2025-10-14 10:30:00'::timestamptz,
      'ESTAR-PAR-LON',
      1170.00,
      true,
      'Travessia pelo Eurotúnel sob o Canal da Mancha. Estação em Paris: Gare du Nord (18 Rue de Dunkerque). Custo € 180 (família).'
    ),
    (
      v_trip_id, v_family_id, 'outro',
      '🚆 Trem Eurostar: Londres (St. Pancras) → Amsterdã (Centraal)',
      'Eurostar',
      '2025-10-17 08:30:00'::timestamptz,
      '2025-10-17 13:15:00'::timestamptz,
      'ESTAR-LON-AMS',
      1170.00,
      true,
      'Viagem internacional de alta velocidade conectando o Reino Unido à Holanda. Custo € 180 (família).'
    ),
    (
      v_trip_id, v_family_id, 'outro',
      '🚆 Trem Eurostar: Amsterdã (Centraal) → Paris (Gare du Nord)',
      'Eurostar',
      '2025-10-20 09:15:00'::timestamptz,
      '2025-10-20 12:35:00'::timestamptz,
      'ESTAR-AMS-PAR',
      1170.00,
      true,
      'Retorno para a França para embarque no voo de volta ao Brasil no final da tarde. Custo € 180 (família).'
    );

  -- 6. Inserir Voos Nacionais e Internacionais
  -- 6.1 Voos Nacionais Brasil (Localizador QKZXEP)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES 
    (
      v_trip_id, v_family_id, 'voo',
      'Voo BH (CNF) → São Paulo (GRU)',
      'Gol / Latam',
      '2025-10-09 11:00:00'::timestamptz,
      '2025-10-09 12:20:00'::timestamptz,
      'QKZXEP',
      650.00,
      true,
      'Voo de conexão para o voo internacional em Guarulhos.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo São Paulo (GRU) → BH (CNF)',
      'Gol / Latam',
      '2025-10-21 16:55:00'::timestamptz,
      '2025-10-21 18:15:00'::timestamptz,
      'QKZXEP',
      650.00,
      true,
      'Chegada final em Belo Horizonte.'
    );

  -- 6.2 Voos Internacionais Iberia (Localizador J1Q6Z)
  INSERT INTO public.reservations (
    trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes
  ) VALUES 
    (
      v_trip_id, v_family_id, 'voo',
      'Voo IB 0272 — São Paulo (GRU) → Madri (MAD)',
      'Iberia',
      '2025-10-09 19:15:00'::timestamptz,
      '2025-10-10 10:10:00'::timestamptz,
      'J1Q6Z',
      5850.00,
      true,
      'Voo noturno transatlântico. Poltronas reservadas: 21A, 21B, 21C (Assentos com espaço extra XL). Passageiro: Alexandre Sauer Pais Lemes e família.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo IB 0573 — Madri (MAD) → Paris Orly (ORY)',
      'Iberia',
      '2025-10-10 11:25:00'::timestamptz,
      '2025-10-10 13:25:00'::timestamptz,
      'J1Q6Z',
      0,
      true,
      'Chegada em Paris às 13:25 e transfer para o hotel ibis Place d''Italie.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo IB 0580 — Paris Orly (ORY) → Madri (MAD)',
      'Iberia',
      '2025-10-20 19:00:00'::timestamptz,
      '2025-10-20 21:05:00'::timestamptz,
      'J1Q6Z',
      0,
      true,
      'Início do retorno para o Brasil.'
    ),
    (
      v_trip_id, v_family_id, 'voo',
      'Voo IB 0267 — Madri (MAD) → São Paulo (GRU)',
      'Iberia',
      '2025-10-20 23:55:00'::timestamptz,
      '2025-10-21 05:55:00'::timestamptz,
      'J1Q6Z',
      5850.00,
      true,
      'Pouso em São Paulo às 05:55 da manhã do dia 21/10.'
    );

  -- 7. Roteiro Dia a Dia Organizado por País (Activities)
  -- -------------------------------------------------------------
  -- PAÍS 1: 🇫🇷 FRANÇA (Paris & Disney) - 10/10 a 14/10
  -- -------------------------------------------------------------
  INSERT INTO public.activities (trip_id, family_id, title, date, time, location, notes, done) VALUES
    (v_trip_id, v_family_id, '[🇧🇷 Embarque] Partida de Belo Horizonte para São Paulo e Madri', '2025-10-09'::date, '11:00:00', 'Confins / Guarulhos', 'Início da jornada europeia: voo nacional para SP e embarque às 19:15 no voo IB 0272 rumo à Europa.', false),
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Chegada em Paris e Check-in no ibis Place d''Italie', '2025-10-10'::date, '13:35:00', 'Aeroporto Paris Orly → 13º arr.', 'Desembarque às 13:25 em Paris Orly, transfer até o hotel ibis Paris Place d’Italie 13ème e acomodação.', false),
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Tarde na Torre Eiffel e Trocadéro', '2025-10-10'::date, '16:30:00', 'Torre Eiffel & Champ de Mars', 'Saída de metrô linha 6 (Place d’Italie → Bir-Hakeim).\n💡 Dica de Ouro: Sente-se do lado esquerdo do metrô para ver a Torre surgir cinematográfica ao cruzar o viaduto sobre o Rio Sena!\nPasseio a pé pelo Champ de Mars, fotos no pôr do sol e apéro/café no Trocadéro.', false),
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Espetáculo da Torre Eiffel Iluminada e Jantar no Bouillon', '2025-10-10'::date, '19:00:00', 'Trocadéro / Rue de Monttessuy', 'A Torre acende às 19h e pisca por 5 minutos a cada hora cheia. Vista clássica da esplanada do Trocadéro.\nJantar nos tradicionais Bouillons parisienses: Bouillon Grenelle (pratos a partir de €10) ou Café Constant.', false),

    -- Sábado 11/10: Cartões Postais de Paris
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Manhã: Arco do Triunfo e Avenue des Champs-Élysées', '2025-10-11'::date, '08:30:00', 'Champs-Élysées & Arco do Triunfo', 'Metrô linha 6 até Trocadéro e caminhada até o Arco do Triunfo.\nPasseio a pé pela célebre Avenue des Champs-Élysées até a Place de la Concorde.\nAlmoço sugerido: Café Madeleine ou Bouillon.', false),
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Tarde: Jardins das Tulherias e Museu do Louvre', '2025-10-11'::date, '14:00:00', 'Jardin des Tuileries & Museu do Louvre', 'Caminhada pelos jardins das Tulherias e entrada no Museu do Louvre (ingresso antecipado € 17) para ver a Mona Lisa, Vênus de Milo e as galerias imperiais.', false),

    -- Domingo 12/10: Paris Histórica e Montmartre
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Manhã: Panthéon, Notre-Dame e Sainte-Chapelle', '2025-10-12'::date, '08:45:00', 'Île de la Cité & Quartier Latin', 'Passeio pelo Panthéon e Jardins de Luxemburgo.\nCaminhada até a Île de la Cité: exterior da Catedral de Notre-Dame e os impressionantes vitrais góticos da Sainte-Chapelle.\nAlmoço na Île Saint-Louis: Café Saint-Régis e o lendário sorvete Berthillon.', false),
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Tarde: Palais Royal e Cruzeiro no Rio Sena', '2025-10-12'::date, '14:30:00', 'Palais Royal & Rio Sena', 'Visita aos jardins do Palais Royal (Colunas de Buren) e Galerie Vivienne.\nÀs 17:30: Passeio de barco pelo Rio Sena (Bateaux Parisiens / Vedettes du Pont Neuf) assistindo aos monumentos iluminados.', false),
    (v_trip_id, v_family_id, '[🇫🇷 França / Paris] Noite: Basílica de Sacré-Cœur e Montmartre', '2025-10-12'::date, '20:00:00', 'Montmartre', 'Subida à Sacré-Cœur com vista noturna espetacular de toda Paris.\nCaminhada pela boêmia Place du Tertre (pintores e artistas de rua) e jantar bistrô.', false),

    -- Segunda 13/10: Disneyland Paris
    (v_trip_id, v_family_id, '[🇫🇷 França / Disney] Disneyland Paris (2 Parques em 1 Dia)', '2025-10-13'::date, '07:30:00', 'Marne-la-Vallée – Chessy', 'Saída cedo de metrô + trem RER A até a Disneyland Paris.\n- Manhã: Walt Disney Studios (Ratatouille, Avengers Campus, Crush’s Coaster)\n- Tarde: Disneyland Park clássico (Space Mountain, Piratas do Caribe, It’s a Small World)\n- 21:00: Show de projeções e fogos no Castelo da Bela Adormecida.\nRetorno a Paris de trem RER A por volta das 22h.', false),

    -- -------------------------------------------------------------
    -- PAÍS 2: 🇬🇧 INGLATERRA (Londres) - 14/10 a 17/10
    -- -------------------------------------------------------------
    (v_trip_id, v_family_id, '[🇬🇧 Inglaterra / Londres] Trem Eurostar para Londres e Check-in no Zedwell', '2025-10-14'::date, '09:00:00', 'Paris Gare du Nord → St. Pancras', 'Embarque no trem de alta velocidade Eurostar saindo da Gare du Nord em Paris rumo a Londres St. Pancras.\nCheck-in ou drop de malas no Zedwell Piccadilly Circus.', false),
    (v_trip_id, v_family_id, '[🇬🇧 Inglaterra / Londres] London Eye, Piccadilly Circus e Covent Garden', '2025-10-14'::date, '14:00:00', 'Westminster & Covent Garden', 'Passeio na famosa roda gigante London Eye com vista panorâmica do Big Ben e Tâmisa.\nCaminhada por Piccadilly Circus e Leicester Square.\nFinal de tarde e jantar em Covent Garden (mercado coberto, artistas e restaurantes em Chinatown).', false),

    -- Quarta 15/10: Museus e Compras
    (v_trip_id, v_family_id, '[🇬🇧 Inglaterra / Londres] Museu de História Natural em South Kensington', '2025-10-15'::date, '09:30:00', 'Cromwell Rd, South Kensington', 'Visita a um dos mais espetaculares museus do mundo com fósseis de dinossauros e arquitetura vitoriana. Entrada gratuita.\nAlmoço em South Kensington.', false),
    (v_trip_id, v_family_id, '[🇬🇧 Inglaterra / Londres] Compras na Oxford Street & Regent Street', '2025-10-15'::date, '14:30:00', 'Oxford Circus & Regent St', 'Tarde de compras na maior rua comercial da Europa:\n- Lojas de departamento e moda: Selfridges, Primark, TK Maxx, Uniqlo\n- Caminhada pela elegante Regent Street (Liberty London e Apple Store)\n- Noite animada em Soho e Leicester Square.', false),

    -- Quinta 16/10: Camden Market e Notting Hill
    (v_trip_id, v_family_id, '[🇬🇧 Inglaterra / Londres] Manhã: Camden Market e Regent''s Canal', '2025-10-16'::date, '09:30:00', 'Camden Lock & Stables Market', 'Exploração das lojas alternativas, arte urbana e comidas de rua do mundo todo às margens do canal.\nVista panorâmica de Londres do alto do Primrose Hill.', false),
    (v_trip_id, v_family_id, '[🇬🇧 Inglaterra / Londres] Tarde: Charme de Notting Hill & British Museum', '2025-10-16'::date, '14:00:00', 'Notting Hill Gate & Bloomsbury', 'Passeio pelas famosas casinhas coloridas de Notting Hill e feirinha da Portobello Road.\nVisita ao British Museum (Pedra de Roseta e múmias egípcias) pertinho do hotel.', false),

    -- -------------------------------------------------------------
    -- PAÍS 3: 🇳🇱 HOLANDA (Amsterdã) - 17/10 a 20/10
    -- -------------------------------------------------------------
    (v_trip_id, v_family_id, '[🇳🇱 Holanda / Amsterdã] Trem Eurostar para Amsterdã e Cruzeiro pelos Canais', '2025-10-17'::date, '08:30:00', 'Londres St. Pancras → Amsterdã Centraal', 'Viagem de trem Eurostar de Londres para Amsterdã. Check-in no Leonardo Royal Hotel.\nÀ tarde: Passeio de barco pelos canais históricos de Amsterdã.\nJantar no charmoso e vibrante bairro gastronômico De Pijp.', false),

    -- Sábado 18/10: Casa de Anne Frank e Jordaan
    (v_trip_id, v_family_id, '[🇳🇱 Holanda / Amsterdã] Visita à Casa de Anne Frank e Bairro Jordaan', '2025-10-18'::date, '09:30:00', 'Prinsengracht 263-267', 'Visita emocionante ao anexo secreto onde Anne Frank escreveu seu diário (ingresso antecipado obrigatório).\nCaminhada sem pressa pelas pontes e ruelas do bairro Jordaan (galerias, cafés e lojas locais).\nJantar e vida noturna na praça Leidseplein.', false),

    -- Domingo 19/10: Vondelpark e Mercado das Flores
    (v_trip_id, v_family_id, '[🇳🇱 Holanda / Amsterdã] Vondelpark, Bloemenmarkt e Rembrandtplein', '2025-10-19'::date, '10:00:00', 'Vondelpark & Singel', 'Passeio pelo Vondelpark (o mais famoso da cidade) e visita ao único mercado de flores flutuante do mundo (Bloemenmarkt).\nJantar de despedida na movimentada praça Rembrandtplein.', false),

    -- Segunda 20/10: Trem de Volta a Paris e Retorno ao Brasil
    (v_trip_id, v_family_id, '[🚆 Conexão] Trem Amsterdã → Paris e Voo de Volta ao Brasil', '2025-10-20'::date, '09:15:00', 'Amsterdã Centraal → Paris Orly → Madri', 'Trem Eurostar de volta a Paris Gare du Nord.\nDeslocamento para o Aeroporto Paris Orly.\nVoo IB 0580 às 19:00 para Madri e conexão no voo IB 0267 (23:55) rumo a São Paulo.', false),
    (v_trip_id, v_family_id, '[🇧🇷 Chegada] Pouso em São Paulo e Retorno a Belo Horizonte', '2025-10-21'::date, '06:00:00', 'Guarulhos (GRU) → Confins (CNF)', 'Chegada ao Brasil em São Paulo às 05:55 da manhã e conexão final para Belo Horizonte às 16:55 (Voo QKZXEP).', false);

  -- 8. Inserir Despesas da Planilha (expenses)
  INSERT INTO public.expenses (trip_id, family_id, description, category, amount, paid, paid_by, spent_on) VALUES
    (v_trip_id, v_family_id, 'Hospedagens Europa (Paris, Londres, Amsterdã)', 'hospedagem', 15000.00, true, 'maluki', '2025-09-10'),
    (v_trip_id, v_family_id, 'Passagens Aéreas Internacionais Iberia + Nacionais', 'transporte', 13000.00, true, 'maluki', '2025-08-15'),
    (v_trip_id, v_family_id, 'Trens de Alta Velocidade Eurostar (Paris ⇄ Londres ⇄ Amsterdã)', 'transporte', 6000.00, true, 'maluki', '2025-08-25'),
    (v_trip_id, v_family_id, 'Alimentação Família (Restaurantes, Bouillons e Cafés)', 'alimentacao', 10000.00, false, 'maluki', '2025-10-10'),
    (v_trip_id, v_family_id, 'Ingressos Atrações e Parques (Disney, Louvre, Torre, Anne Frank)', 'passeios', 2500.00, true, 'maluki', '2025-09-20'),
    (v_trip_id, v_family_id, 'Seguro Viagem Internacional Schengen & UK', 'outros', 600.00, true, 'maluki', '2025-09-05');

  -- 9. Inserir Checklist Completo (checklist_items)
  INSERT INTO public.checklist_items (trip_id, family_id, kind, title, owner_name, done) VALUES
    (v_trip_id, v_family_id, 'preparo', 'Passaporte válido por no mínimo 6 meses após o retorno', 'Família', true),
    (v_trip_id, v_family_id, 'preparo', 'Verificar requisitos de entrada: ETIAS (União Europeia) e UK ETA (Reino Unido)', 'Família', true),
    (v_trip_id, v_family_id, 'preparo', 'Seguro Viagem Europa com cobertura médica mínima de € 30.000 (Tratado de Schengen)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Habilitar cartões internacionais (Nomad/Wise) e levar € 400 em espécie', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Configurar celulares e relógios com carteiras digitais (Apple Pay / Google Pay)', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Comprar ingressos antecipados com horário marcado para a Disneyland Paris', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Comprar ingressos antecipados para o Museu do Louvre e Sainte-Chapelle', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Comprar ingressos antecipados com data fixa para a Casa de Anne Frank em Amsterdã', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Baixar passagens do Eurostar e cartões de embarque da Iberia offline', 'maluki', true),
    (v_trip_id, v_family_id, 'preparo', 'Ativar chips eSIM de internet internacional com cobertura Europa + Reino Unido', 'maluki', false),
    (v_trip_id, v_family_id, 'preparo', 'Baixar mapas offline de Paris, Londres e Amsterdã no Google Maps', 'maluki', false),
    (v_trip_id, v_family_id, 'bagagem', 'Mala de mão dentro do limite permitido (< 10 kg)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Adaptador universal de tomadas (Tipo C para Europa e Tipo G para o Reino Unido)', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Power bank (carregador portátil >= 10.000 mAh)', 'maluki', false),
    (v_trip_id, v_family_id, 'bagagem', 'Cadeados padrão TSA e etiquetas de identificação nas bagagens', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Medicamentos de uso contínuo com receitas médicas em inglês', 'Família', false),
    (v_trip_id, v_family_id, 'bagagem', 'Casacos corta-vento impermeáveis e sapatos confortáveis para muitas caminhadas', 'Família', false);

  -- 10. Contatos de Emergência
  INSERT INTO public.emergency_contacts (trip_id, family_id, name, phone, notes) VALUES
    (v_trip_id, v_family_id, 'Seguro Viagem Internacional (Assistência Médica Europa)', '+34 91 593 8690', 'Central internacional 24h para acionamento de urgência médica.'),
    (v_trip_id, v_family_id, 'Consulado-Geral do Brasil em Paris (França)', '+33 1 45 61 63 00', 'Plantão consular para emergências de brasileiros na França.'),
    (v_trip_id, v_family_id, 'Consulado-Geral do Brasil em Londres (Reino Unido)', '+44 20 7747 4500', 'Plantão consular para emergências de brasileiros no Reino Unido.'),
    (v_trip_id, v_family_id, 'Consulado-Geral do Brasil em Amsterdã (Holanda)', '+31 20 305 6310', 'Plantão consular para emergências de brasileiros na Holanda.'),
    (v_trip_id, v_family_id, 'Número Europeu de Emergência Geral', '112', 'Polícia, bombeiros e ambulância válido em toda a União Europeia e Reino Unido (999).');

  RAISE NOTICE 'Viagem Europa atualizada com sucesso!';
END $$;
`;

fs.writeFileSync('docker/europa.sql', sql, 'utf8');
console.log('Script docker/europa.sql gerado com sucesso!');
