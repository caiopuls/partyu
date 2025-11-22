-- Execute este SQL no SQL Editor do seu painel Supabase para atualizar o banco de dados

-- 1. Adicionar colunas para status e dados de pagamento
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pix_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pix_key_type TEXT;

-- 2. Atualizar permissões de Role (Adicionar 'organizer')
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'organizer'));

-- 3. Garantir que o Admin tenha as permissões corretas (caso já exista)
UPDATE profiles SET role = 'admin', status = 'approved' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@partyu.com');
