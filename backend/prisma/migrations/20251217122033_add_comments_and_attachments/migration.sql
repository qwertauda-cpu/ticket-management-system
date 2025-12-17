-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL DEFAULT 'user',
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ticket_comments_ticketId_createdAt_idx" ON "ticket_comments"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "ticket_attachments_ticketId_createdAt_idx" ON "ticket_attachments"("ticketId", "createdAt");
