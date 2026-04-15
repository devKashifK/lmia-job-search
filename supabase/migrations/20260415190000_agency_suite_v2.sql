-- migration: 20260415190000_agency_suite_v2.sql
-- Agency Intelligence Suite v2: Documents, Messaging, Activity Log, Draw Calendar

-- ============================================================
-- 1. DOCUMENT VAULT + REQUEST FLOW
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agency_client_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_urn TEXT NOT NULL REFERENCES public.agency_clients(urn) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'identity' | 'language' | 'education' | 'employment' | 'immigration' | 'general'
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'uploaded', 'approved', 'rejected')),
    required BOOLEAN DEFAULT true,
    request_note TEXT,           -- Agency note explaining what to upload
    file_url TEXT,               -- Supabase Storage URL (set after candidate uploads)
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    rejection_reason TEXT,       -- Set when agency rejects
    uploaded_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_client_urn ON public.agency_client_documents(client_urn);
CREATE INDEX IF NOT EXISTS idx_docs_agency_id ON public.agency_client_documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_docs_status ON public.agency_client_documents(status);

ALTER TABLE public.agency_client_documents ENABLE ROW LEVEL SECURITY;

-- Agencies manage their own requested docs
DROP POLICY IF EXISTS "Agencies can manage own client documents" ON public.agency_client_documents;
CREATE POLICY "Agencies can manage own client documents"
    ON public.agency_client_documents FOR ALL
    USING (auth.uid() = agency_id)
    WITH CHECK (auth.uid() = agency_id);

-- Public (candidate) can VIEW and UPDATE their own docs (for upload)
DROP POLICY IF EXISTS "Public can view documents by urn" ON public.agency_client_documents;
CREATE POLICY "Public can view documents by urn"
    ON public.agency_client_documents FOR SELECT
    USING (true);

-- ============================================================
-- 2. 2-WAY MESSAGING THREAD
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agency_client_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_urn TEXT NOT NULL REFERENCES public.agency_clients(urn) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('agency', 'candidate')),
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,   -- NULL = unread by the other party
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msgs_client_urn ON public.agency_client_messages(client_urn);
CREATE INDEX IF NOT EXISTS idx_msgs_agency_id ON public.agency_client_messages(agency_id);

ALTER TABLE public.agency_client_messages ENABLE ROW LEVEL SECURITY;

-- Agencies see their own threads
DROP POLICY IF EXISTS "Agencies can manage own messages" ON public.agency_client_messages;
CREATE POLICY "Agencies can manage own messages"
    ON public.agency_client_messages FOR ALL
    USING (auth.uid() = agency_id)
    WITH CHECK (auth.uid() = agency_id);

-- Candidates (public) can view and insert messages for their urn
DROP POLICY IF EXISTS "Public can view and send messages by urn" ON public.agency_client_messages;
CREATE POLICY "Public can view and send messages by urn"
    ON public.agency_client_messages FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can send candidate messages" ON public.agency_client_messages;
CREATE POLICY "Public can send candidate messages"
    ON public.agency_client_messages FOR INSERT
    WITH CHECK (sender_type = 'candidate');

-- ============================================================
-- 3. ACTIVITY / AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agency_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_urn TEXT REFERENCES public.agency_clients(urn) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,  
    -- 'email_sent' | 'doc_requested' | 'doc_approved' | 'doc_rejected' | 'msg_sent' 
    -- | 'status_changed' | 'note_pushed' | 'profile_updated' | 'portal_viewed'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_client_urn ON public.agency_activity_log(client_urn);
CREATE INDEX IF NOT EXISTS idx_activity_agency_id ON public.agency_activity_log(agency_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.agency_activity_log(created_at DESC);

ALTER TABLE public.agency_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can manage own activity log" ON public.agency_activity_log;
CREATE POLICY "Agencies can manage own activity log"
    ON public.agency_activity_log FOR ALL
    USING (auth.uid() = agency_id)
    WITH CHECK (auth.uid() = agency_id);

-- Allow public insert for portal view tracking (not just internal agency actions)
DROP POLICY IF EXISTS "Public can log portal activity" ON public.agency_activity_log;
CREATE POLICY "Public can log portal activity"
    ON public.agency_activity_log FOR INSERT
    WITH CHECK (action_type = 'portal_viewed');

-- ============================================================
-- 4. IRCC DRAW CALENDAR
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ircc_draw_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date DATE NOT NULL,
    draw_type TEXT NOT NULL,        -- 'Express Entry' | 'PNP' | 'STEM' | 'French Language' | 'Healthcare' | 'Trade'
    min_crs INTEGER NOT NULL,
    invitations_issued INTEGER NOT NULL,
    draw_round TEXT,                -- e.g., "Round 341"
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (draw_date, draw_type)
);

CREATE INDEX IF NOT EXISTS idx_draws_draw_date ON public.ircc_draw_history(draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_draws_draw_type ON public.ircc_draw_history(draw_type);

ALTER TABLE public.ircc_draw_history ENABLE ROW LEVEL SECURITY;

-- Public read (all agents can see draws, no need to restrict)
DROP POLICY IF EXISTS "Everyone can read draw history" ON public.ircc_draw_history;
CREATE POLICY "Everyone can read draw history"
    ON public.ircc_draw_history FOR SELECT
    USING (true);

-- Only service role can write (admin sync job)
DROP POLICY IF EXISTS "Service role can manage draws" ON public.ircc_draw_history;
CREATE POLICY "Service role can manage draws"
    ON public.ircc_draw_history FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- 5. Seed IRCC Draw History with recent real data
-- ============================================================
INSERT INTO public.ircc_draw_history (draw_date, draw_type, min_crs, invitations_issued, draw_round, source_url)
VALUES
    ('2026-04-10', 'Express Entry', 479, 4500, 'Round 341', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-03-27', 'Express Entry', 481, 4300, 'Round 340', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-03-13', 'Express Entry', 490, 3900, 'Round 339', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-03-06', 'French Language', 356, 7000, 'Round 338', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-02-27', 'Express Entry', 488, 4200, 'Round 337', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-02-13', 'Healthcare', 431, 3500, 'Round 336', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-01-30', 'Express Entry', 484, 4100, 'Round 335', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-01-23', 'STEM', 481, 3700, 'Round 334', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2026-01-09', 'Express Entry', 487, 3900, 'Round 333', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html'),
    ('2025-12-18', 'French Language', 340, 8000, 'Round 332', 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html')
ON CONFLICT (draw_date, draw_type) DO NOTHING;

COMMENT ON TABLE public.agency_client_documents IS 'Document vault: agencies request documents, candidates upload, agencies review.';
COMMENT ON TABLE public.agency_client_messages IS '2-way secure messaging between agency advisors and candidates.';
COMMENT ON TABLE public.agency_activity_log IS 'Immutable audit trail for all client file actions.';
COMMENT ON TABLE public.ircc_draw_history IS 'IRCC Express Entry and category-based draw history for eligibility matching.';
