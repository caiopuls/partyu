-- Adicionar campo metadata na tabela orders para armazenar informações adicionais
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índice para buscas no metadata
CREATE INDEX IF NOT EXISTS idx_orders_metadata ON orders USING GIN (metadata);




