-- Seed de dados de teste para eventos, tipos de ingressos e tickets do usuário especificado
-- ATENÇÃO: Este seed assume que o usuário com o ID abaixo já existe em auth.users e profiles
-- ID do perfil alvo
DO $$
DECLARE
  target_user UUID := '6bebeed5-d807-46b8-9360-68311193a96f';
  evt_user_1 UUID;
  evt_user_2 UUID;
  evt_other_1 UUID;
  evt_other_2 UUID;
  tt_user_1a UUID;
  tt_user_1b UUID;
  tt_user_2a UUID;
  tt_other_1a UUID;
  tt_other_2a UUID;
  order_1 UUID;
  ticket_1 UUID;
  ticket_2 UUID;
  listing_1 UUID;
BEGIN
  -- Eventos do usuário alvo
  INSERT INTO events (title, description, city, state, venue, address, event_date, banner_url, category, organizer_id, status)
  VALUES ('Festival PartyU Sunset', 'Música eletrônica ao pôr do sol', 'São Paulo', 'SP', 'Parque da Cidade', 'Av. das Nações, 1000', NOW() + INTERVAL '20 days', NULL, 'music', target_user, 'active')
  RETURNING id INTO evt_user_1;

  INSERT INTO events (title, description, city, state, venue, address, event_date, banner_url, category, organizer_id, status)
  VALUES ('Conferência Dev PartyU', 'Tecnologia, startups e networking', 'Florianópolis', 'SC', 'CentroSul', 'Av. Gov. Gustavo Richard, 850', NOW() + INTERVAL '35 days', NULL, 'conference', target_user, 'active')
  RETURNING id INTO evt_user_2;

  -- Tipos de ingresso para eventos do usuário
  INSERT INTO event_ticket_types (event_id, name, description, price, platform_fee_percentage, total_quantity, sold_quantity, lot_number, status)
  VALUES (evt_user_1, 'Pista', 'Acesso geral', 120.00, 10.00, 300, 0, 1, 'active')
  RETURNING id INTO tt_user_1a;

  INSERT INTO event_ticket_types (event_id, name, description, price, platform_fee_percentage, total_quantity, sold_quantity, lot_number, status)
  VALUES (evt_user_1, 'VIP', 'Área VIP com open bar', 320.00, 10.00, 100, 0, 1, 'active')
  RETURNING id INTO tt_user_1b;

  INSERT INTO event_ticket_types (event_id, name, description, price, platform_fee_percentage, total_quantity, sold_quantity, lot_number, status)
  VALUES (evt_user_2, 'Ingresso Único', 'Acesso ao evento', 150.00, 10.00, 200, 0, 1, 'active')
  RETURNING id INTO tt_user_2a;

  -- Eventos de outros perfis
  INSERT INTO events (title, description, city, state, venue, address, event_date, banner_url, category, organizer_id, status)
  VALUES ('Show Indie Night', 'Bandas independentes', 'Rio de Janeiro', 'RJ', 'Vivo Rio', 'Av. Infante Dom Henrique, 85', NOW() + INTERVAL '10 days', NULL, 'music', NULL, 'active')
  RETURNING id INTO evt_other_1;

  INSERT INTO events (title, description, city, state, venue, address, event_date, banner_url, category, organizer_id, status)
  VALUES ('Expo Arte Urbana', 'Instalações e grafite', 'Curitiba', 'PR', 'Museu Municipal', 'R. Kellers, 289', NOW() + INTERVAL '50 days', NULL, 'art', NULL, 'active')
  RETURNING id INTO evt_other_2;

  -- Tipos de ingresso para eventos de outros perfis
  INSERT INTO event_ticket_types (event_id, name, description, price, platform_fee_percentage, total_quantity, sold_quantity, lot_number, status)
  VALUES (evt_other_1, 'Pista', 'Acesso geral', 90.00, 10.00, 400, 0, 1, 'active')
  RETURNING id INTO tt_other_1a;

  INSERT INTO event_ticket_types (event_id, name, description, price, platform_fee_percentage, total_quantity, sold_quantity, lot_number, status)
  VALUES (evt_other_2, 'Inteira', 'Entrada inteira', 60.00, 10.00, 500, 0, 1, 'active')
  RETURNING id INTO tt_other_2a;

  -- Pedido do usuário alvo
  INSERT INTO orders (user_id, total_amount, status, origin, metadata)
  VALUES (target_user, 180.00, 'paid', 'primary', jsonb_build_object('note','Compra seed de teste'))
  RETURNING id INTO order_1;

  -- Dois tickets para este pedido
  INSERT INTO user_tickets (user_id, order_id, event_id, ticket_type_id, status, qr_code, ticket_number)
  VALUES (target_user, order_1, evt_other_1, tt_other_1a, 'active', NULL, 'SEED-' || floor(random()*1000000)::text)
  RETURNING id INTO ticket_1;

  INSERT INTO user_tickets (user_id, order_id, event_id, ticket_type_id, status, qr_code, ticket_number)
  VALUES (target_user, order_1, evt_other_1, tt_other_1a, 'active', NULL, 'SEED-' || floor(random()*1000000)::text)
  RETURNING id INTO ticket_2;

  -- Lista um dos tickets para revenda
  INSERT INTO resale_listings (ticket_id, seller_id, asking_price, platform_fee_percentage, status, expires_at)
  VALUES (ticket_2, target_user, 110.00, 10.00, 'active', NOW() + INTERVAL '7 days')
  RETURNING id INTO listing_1;
END$$;


