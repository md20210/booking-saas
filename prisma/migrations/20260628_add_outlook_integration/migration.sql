-- Create OutlookIntegration table for Microsoft Office 365 / Outlook Calendar integration
CREATE TABLE "OutlookIntegration" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "scope" TEXT NOT NULL,
  "calendarId" TEXT DEFAULT 'primary' NOT NULL,
  "calendarName" TEXT,
  "email" TEXT,
  "displayName" TEXT,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "OutlookIntegration_userId_idx" ON "OutlookIntegration"("userId");
