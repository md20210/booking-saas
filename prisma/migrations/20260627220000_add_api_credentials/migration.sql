-- CreateTable
CREATE TABLE "ApiCredentials" (
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

-- CreateIndex
CREATE UNIQUE INDEX "ApiCredentials_userId_key" ON "ApiCredentials"("userId");

-- CreateIndex
CREATE INDEX "ApiCredentials_userId_idx" ON "ApiCredentials"("userId");

-- AddForeignKey
ALTER TABLE "ApiCredentials" ADD CONSTRAINT "ApiCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
