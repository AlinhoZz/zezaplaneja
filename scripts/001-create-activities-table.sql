-- Cria a tabela 'activities' se ela não existir
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

-- Cria uma função para atualizar automaticamente a coluna 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria um trigger que chama a função antes de cada atualização na tabela 'activities'
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adiciona um índice para a coluna 'date' para otimizar buscas por data
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities (date);

-- Adiciona um índice para a coluna 'category' para otimizar buscas por categoria
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category);

-- Adiciona um índice para a coluna 'completed' para otimizar buscas por status
CREATE INDEX IF NOT EXISTS idx_activities_completed ON activities (completed);

-- Comentários para documentação
COMMENT ON TABLE activities IS 'Tabela para armazenar as atividades do planejador.';
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
COMMENT ON COLUMN activities.created_at IS 'Timestamp de quando a atividade foi criada.';
COMMENT ON COLUMN activities.updated_at IS 'Timestamp da última atualização da atividade.';
