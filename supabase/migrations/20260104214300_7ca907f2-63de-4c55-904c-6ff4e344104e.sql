-- Add base_price column to providers for Best Value calculation
ALTER TABLE public.providers 
ADD COLUMN base_price numeric DEFAULT 500;

-- Update providers with varied prices
UPDATE providers SET base_price = 450 WHERE id = 'f9445cdf-0aa7-469b-b4fe-b7b8510fbd1c';
UPDATE providers SET base_price = 750 WHERE id = '4ac13410-6d1b-4500-a94e-b304b365e511';
UPDATE providers SET base_price = 550 WHERE id = '3724a2ce-4cd5-4dc8-b2fd-9bc9f816410d';
UPDATE providers SET base_price = 620 WHERE id = 'd4f26538-6dd7-4476-817e-998069fe7b33';
UPDATE providers SET base_price = 480 WHERE id = 'c0765a56-4932-486c-97d5-0be25eda7ec9';
UPDATE providers SET base_price = 700 WHERE id = '47a1d924-e575-4ab2-a88a-65d969ad9bb9';