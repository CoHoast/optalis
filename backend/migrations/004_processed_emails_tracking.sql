-- Processed Emails Tracking Table
-- Ensures emails are NEVER processed twice, regardless of S3 state
-- Date: 2026-03-11

-- Track all processed emails
CREATE TABLE IF NOT EXISTS processed_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    s3_key VARCHAR(500) NOT NULL UNIQUE,
    message_id VARCHAR(500),  -- Email Message-ID header for additional tracking
    email_from VARCHAR(500),
    email_subject VARCHAR(1000),
    patient_name VARCHAR(500),
    application_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'processed',  -- processed, failed, skipped
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_processed_emails_s3_key ON processed_emails(s3_key);
CREATE INDEX IF NOT EXISTS idx_processed_emails_message_id ON processed_emails(message_id);
CREATE INDEX IF NOT EXISTS idx_processed_emails_status ON processed_emails(status);
CREATE INDEX IF NOT EXISTS idx_processed_emails_processed_at ON processed_emails(processed_at);

-- Function to check if an email was already processed
-- Returns TRUE if already processed, FALSE if new
CREATE OR REPLACE FUNCTION is_email_processed(p_s3_key VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM processed_emails WHERE s3_key = p_s3_key
    );
END;
$$ LANGUAGE plpgsql;
