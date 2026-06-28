-- Add Google Ads conversion tracking fields to ApiCredentials
ALTER TABLE "ApiCredentials" ADD COLUMN IF NOT EXISTS "googleAdsCustomerId" TEXT;
ALTER TABLE "ApiCredentials" ADD COLUMN IF NOT EXISTS "googleAdsLoginCustomerId" TEXT;
ALTER TABLE "ApiCredentials" ADD COLUMN IF NOT EXISTS "googleAdsConversionActionId" TEXT;
