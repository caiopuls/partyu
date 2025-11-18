-- Adiciona coluna bio ao perfil
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT;


