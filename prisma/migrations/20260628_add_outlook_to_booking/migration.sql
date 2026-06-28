-- Add Outlook Calendar fields to Booking table
ALTER TABLE "Booking" ADD COLUMN "outlookEventId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "teamsMeetLink" TEXT;
