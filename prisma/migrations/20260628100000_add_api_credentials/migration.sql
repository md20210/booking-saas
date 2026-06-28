-- Clean up old failed migration record
DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260627220000_add_api_credentials';

-- CreateTable (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "ApiCredentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleOAuthClientId" TEXT,
    "googleOAuthClientSecret" TEXT,
    "googleAdsDeveloperToken" TEXT,
    "googleAdsClientId" TEXT,
    "googleAdsClientSecret" TEXT,
    "googleAdsRefreshToken" TEXT,
    "emailProvider" TEXT,
    "emailApiKey" TEXT,
    "emailFromAddress" TEXT,
    "emailFromName" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ApiCredentials_userId_key') THEN
        CREATE UNIQUE INDEX "ApiCredentials_userId_key" ON "ApiCredentials"("userId");
    END IF;
END $$;

-- CreateIndex (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ApiCredentials_userId_idx') THEN
        CREATE INDEX "ApiCredentials_userId_idx" ON "ApiCredentials"("userId");
    END IF;
END $$;

-- AddForeignKey (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'ApiCredentials_userId_fkey'
    ) THEN
        ALTER TABLE "ApiCredentials" ADD CONSTRAINT "ApiCredentials_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
