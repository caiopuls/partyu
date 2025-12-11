-- ============================================
-- MIGRAÇÃO: Converter category de TEXT para ENUM
-- ============================================
-- Esta migração converte o campo category da tabela events
-- de TEXT para ENUM para garantir consistência dos dados
-- ============================================

-- 1. Criar o tipo ENUM com as categorias permitidas
DO $$ 
BEGIN
  -- Verifica se o tipo já existe antes de criar
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
    CREATE TYPE event_category AS ENUM (
      'Festas',
      'Shows',
      'Festivais',
      'Eletrônica',
      'Sertanejo',
      'Trap & Rap',
      'Universitárias',
      'Teatro'
    );
    RAISE NOTICE '✅ Tipo ENUM event_category criado com sucesso!';
  ELSE
    RAISE NOTICE '⚠️  Tipo ENUM event_category já existe.';
  END IF;
END $$;

-- 2. Verificar se há categorias inválidas antes de converter
DO $$
DECLARE
  invalid_categories TEXT[];
  invalid_count INTEGER;
BEGIN
  SELECT ARRAY_AGG(DISTINCT category), COUNT(DISTINCT category)
  INTO invalid_categories, invalid_count
  FROM events
  WHERE category IS NOT NULL
    AND category NOT IN (
      'Festas', 'Shows', 'Festivais', 'Eletrônica',
      'Sertanejo', 'Trap & Rap', 'Universitárias', 'Teatro'
    );
  
  IF invalid_categories IS NOT NULL AND array_length(invalid_categories, 1) > 0 THEN
    RAISE EXCEPTION '❌ ERRO: Encontradas % categoria(s) inválida(s): %. Por favor, atualize esses eventos antes de continuar.', 
      invalid_count, array_to_string(invalid_categories, ', ');
  ELSE
    RAISE NOTICE '✅ Todas as categorias são válidas!';
  END IF;
END $$;

-- 3. Adicionar uma coluna temporária com o tipo ENUM
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS category_new event_category;

-- 4. Copiar dados da coluna antiga para a nova (com conversão)
UPDATE events
SET category_new = category::event_category
WHERE category IN (
  'Festas', 'Shows', 'Festivais', 'Eletrônica',
  'Sertanejo', 'Trap & Rap', 'Universitárias', 'Teatro'
);

-- 5. Verificar se todos os registros foram convertidos
DO $$
DECLARE
  total_events INTEGER;
  converted_events INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_events FROM events WHERE category IS NOT NULL;
  SELECT COUNT(*) INTO converted_events FROM events WHERE category_new IS NOT NULL;
  
  IF total_events != converted_events THEN
    RAISE EXCEPTION '❌ Erro: Nem todos os eventos foram convertidos. Total: %, Convertidos: %', total_events, converted_events;
  END IF;
  
  RAISE NOTICE '✅ Conversão bem-sucedida: % eventos convertidos', converted_events;
END $$;

-- 6. Remover a coluna antiga
ALTER TABLE events 
DROP COLUMN IF EXISTS category;

-- 7. Renomear a nova coluna para o nome original
ALTER TABLE events 
RENAME COLUMN category_new TO category;

-- 8. Adicionar constraint NOT NULL (se necessário)
ALTER TABLE events 
ALTER COLUMN category SET NOT NULL;

-- 9. Criar índice para melhor performance (se ainda não existir)
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- ============================================
-- MIGRAÇÃO CONCLUÍDA
-- ============================================
-- O campo category agora é do tipo ENUM e só aceita
-- os valores definidos acima.
-- ============================================
