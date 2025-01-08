-- Check if the table exists and is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_pages') THEN
        CREATE TABLE user_pages (
            user_root VARCHAR(255) PRIMARY KEY,
            page_data TEXT
        );
    ELSE
        IF NOT EXISTS (SELECT 1 FROM user_pages LIMIT 1) THEN
            -- Table exists but is empty
            -- You can perform additional initialization if needed
        END IF;
    END IF;
END $$;
