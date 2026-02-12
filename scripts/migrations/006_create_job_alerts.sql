-- Create job_alerts table
CREATE TYPE alert_frequency AS ENUM ('daily', 'weekly', 'instant');

CREATE TABLE IF NOT EXISTS job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    criteria JSONB NOT NULL,
    frequency alert_frequency DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own alerts"
    ON job_alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
    ON job_alerts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
    ON job_alerts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
    ON job_alerts FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_alerts_updated_at
    BEFORE UPDATE ON job_alerts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
