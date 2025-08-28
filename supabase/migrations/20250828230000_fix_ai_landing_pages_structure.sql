-- Fix ai_landing_pages table structure
-- Remove user_id column if it exists and ensure proper structure

-- First, check if user_id column exists and remove it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.ai_landing_pages DROP COLUMN user_id;
        RAISE NOTICE 'Removed user_id column from ai_landing_pages table';
    ELSE
        RAISE NOTICE 'user_id column does not exist in ai_landing_pages table';
    END IF;
END $$;

-- Ensure the table has the correct structure by adding missing columns if they don't exist
DO $$
BEGIN
    -- Add doctor_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'doctor_id'
    ) THEN
        ALTER TABLE public.ai_landing_pages ADD COLUMN doctor_id TEXT;
        RAISE NOTICE 'Added doctor_id column to ai_landing_pages table';
    END IF;
    
    -- Add quiz_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'quiz_type'
    ) THEN
        ALTER TABLE public.ai_landing_pages ADD COLUMN quiz_type TEXT DEFAULT 'NOSE';
        RAISE NOTICE 'Added quiz_type column to ai_landing_pages table';
    END IF;
    
    -- Add content column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'content'
    ) THEN
        ALTER TABLE public.ai_landing_pages ADD COLUMN content JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added content column to ai_landing_pages table';
    END IF;
    
    -- Add chatbot_colors column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'chatbot_colors'
    ) THEN
        ALTER TABLE public.ai_landing_pages ADD COLUMN chatbot_colors JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added chatbot_colors column to ai_landing_pages table';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.ai_landing_pages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        RAISE NOTICE 'Added created_at column to ai_landing_pages table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.ai_landing_pages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        RAISE NOTICE 'Added updated_at column to ai_landing_pages table';
    END IF;
END $$;

-- Make doctor_id NOT NULL if it's not already
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'doctor_id'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.ai_landing_pages ALTER COLUMN doctor_id SET NOT NULL;
        RAISE NOTICE 'Made doctor_id NOT NULL in ai_landing_pages table';
    END IF;
END $$;

-- Make quiz_type NOT NULL if it's not already
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_landing_pages' 
        AND column_name = 'quiz_type'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.ai_landing_pages ALTER COLUMN quiz_type SET NOT NULL;
        RAISE NOTICE 'Made quiz_type NOT NULL in ai_landing_pages table';
    END IF;
END $$;

-- Drop the old unique constraint on doctor_id if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'ai_landing_pages' 
        AND indexname = 'ai_landing_pages_doctor_id_idx'
    ) THEN
        DROP INDEX ai_landing_pages_doctor_id_idx;
        RAISE NOTICE 'Dropped old unique index on doctor_id in ai_landing_pages table';
    END IF;
END $$;

-- Create new unique constraint on the combination of doctor_id and quiz_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'ai_landing_pages' 
        AND indexname = 'ai_landing_pages_doctor_quiz_unique_idx'
    ) THEN
        CREATE UNIQUE INDEX ai_landing_pages_doctor_quiz_unique_idx ON public.ai_landing_pages (doctor_id, quiz_type);
        RAISE NOTICE 'Created unique index on (doctor_id, quiz_type) in ai_landing_pages table';
    END IF;
END $$;
