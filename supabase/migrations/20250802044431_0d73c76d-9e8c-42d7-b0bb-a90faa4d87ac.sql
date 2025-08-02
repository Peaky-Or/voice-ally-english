-- Fix conversations table grammar_errors column type from TEXT[] to JSONB
ALTER TABLE public.conversations 
ALTER COLUMN grammar_errors TYPE TEXT[] USING 
  CASE 
    WHEN grammar_errors IS NULL THEN NULL
    WHEN jsonb_typeof(grammar_errors) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(grammar_errors))
    ELSE ARRAY[]::TEXT[]
  END;