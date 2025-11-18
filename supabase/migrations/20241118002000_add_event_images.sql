-- Add multiple image support to events and featured image
ALTER TABLE events
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- RLS: allow users to insert/update their own events (organizer_id = auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Users can create their own events'
  ) THEN
    CREATE POLICY "Users can create their own events"
      ON events FOR INSERT
      WITH CHECK (organizer_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Users can update their own events'
  ) THEN
    CREATE POLICY "Users can update their own events"
      ON events FOR UPDATE
      USING (organizer_id = auth.uid());
  END IF;
END $$;


