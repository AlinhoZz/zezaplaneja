-- Este script configura a tabela 'activities' com suporte a autenticação (user_id) e Row Level Security (RLS)
-- Ele é idempotente, ou seja, pode ser executado múltiplas vezes sem causar erros.

-- 1. Cria a tabela 'activities' se ela não existir
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ID único para cada atividade
    title VARCHAR(255) NOT NULL, -- Título da atividade
    description TEXT, -- Descrição detalhada (opcional)
    date DATE NOT NULL, -- Data da atividade (formato YYYY-MM-DD)
    start_time TIME NOT NULL, -- Hora de início (formato HH:MM)
    end_time TIME NOT NULL, -- Hora de fim (formato HH:MM)
    category VARCHAR(50) NOT NULL DEFAULT 'outros', -- Categoria da atividade
    priority VARCHAR(10) NOT NULL DEFAULT 'medium', -- Prioridade (low, medium, high)
    completed BOOLEAN NOT NULL DEFAULT FALSE, -- Status de conclusão
    notifications JSONB, -- Configurações de notificação (JSON)
    recurrence JSONB, -- Configurações de recorrência (JSON)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Data de criação
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Data da última atualização
);

-- 2. Adiciona a coluna user_id à tabela activities, SOMENTE SE ELA AINDA NÃO EXISTIR
-- Esta coluna fará referência à tabela de usuários do Supabase (auth.users)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='user_id') THEN
        ALTER TABLE activities
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna user_id adicionada à tabela activities.';
    ELSE
        RAISE NOTICE 'Coluna user_id já existe na tabela activities. Pulando adição.';
    END IF;
END$$;

-- 3. Cria uma função para atualizar automaticamente a coluna 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Cria um trigger que chama a função antes de cada atualização na tabela 'activities'
-- Garante que o trigger seja removido e recriado para idempotência
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilita Row Level Security (RLS) na tabela activities
DO $$
BEGIN
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Row Level Security habilitado para a tabela activities.';
END$$;

-- 6. Cria ou substitui as políticas de RLS para a tabela 'activities'
-- Estas políticas garantem que os usuários só possam acessar/modificar suas próprias atividades.

-- Política para permitir que usuários selecionem (leiam) suas próprias atividades
DROP POLICY IF EXISTS "Users can view their own activities." ON activities;
CREATE POLICY "Users can view their own activities."
ON activities FOR SELECT
USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram (criem) suas próprias atividades
DROP POLICY IF EXISTS "Users can create their own activities." ON activities;
CREATE POLICY "Users can create their own activities."
ON activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias atividades
DROP POLICY IF EXISTS "Users can update their own activities." ON activities;
CREATE POLICY "Users can update their own activities."
ON activities FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários excluam suas próprias atividades
DROP POLICY IF EXISTS "Users can delete their own activities." ON activities;
CREATE POLICY "Users can delete their own activities."
ON activities FOR DELETE
USING (auth.uid() = user_id);

-- 7. Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities (date);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category);
CREATE INDEX IF NOT EXISTS idx_activities_completed ON activities (completed);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities (user_id); -- Novo índice para user_id

-- 8. Comentários para documentação (estes são idempotentes)
COMMENT ON TABLE activities IS 'Tabela para armazenar as atividades do planejador, com RLS para acesso por usuário.';
COMMENT ON COLUMN activities.id IS 'Identificador único da atividade.';
COMMENT ON COLUMN activities.title IS 'Título principal da atividade.';
COMMENT ON COLUMN activities.description IS 'Descrição detalhada da atividade.';
COMMENT ON COLUMN activities.date IS 'Data em que a atividade está agendada.';
COMMENT ON COLUMN activities.start_time IS 'Hora de início da atividade.';
COMMENT ON COLUMN activities.end_time IS 'Hora de término da atividade.';
COMMENT ON COLUMN activities.category IS 'Categoria da atividade (ex: estudo, trabalho, lazer).';
COMMENT ON COLUMN activities.priority IS 'Nível de prioridade da atividade (baixa, média, alta).';
COMMENT ON COLUMN activities.completed IS 'Indica se a atividade foi concluída.';
COMMENT ON COLUMN activities.notifications IS 'Configurações de notificação para a atividade.';
COMMENT ON COLUMN activities.recurrence IS 'Configurações de recorrência para a atividade.';
COMMENT ON COLUMN activities.user_id IS 'ID do usuário proprietário da atividade, referenciando auth.users.id.';
COMMENT ON COLUMN activities.created_at IS 'Timestamp de quando a atividade foi criada.';
COMMENT ON COLUMN activities.updated_at IS 'Timestamp da última atualização da atividade.';

-- Mensagem final de conclusão
DO $$
BEGIN
    RAISE NOTICE 'Script de configuração de user_id e RLS para a tabela activities concluído.';
END$$;
