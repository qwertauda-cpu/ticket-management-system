-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tenant_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tenant_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tenant_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tenant_user_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "tenantUserId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tenant_user_permissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tenant_user_permissions_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "tenant_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tenant_user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "description" TEXT,
    "isNationalSla" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT,
    "status" TEXT NOT NULL,
    "assigneeType" TEXT,
    "assigneeId" TEXT,
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "qaStatus" TEXT,
    "qaNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_users_tenantId_userId_key" ON "tenant_users"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_tenantId_key_key" ON "permissions"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_user_permissions_tenantUserId_permissionId_key" ON "tenant_user_permissions"("tenantUserId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketNumber_key" ON "tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "tickets_tenantId_status_idx" ON "tickets"("tenantId", "status");

-- CreateIndex
CREATE INDEX "tickets_tenantId_isNationalSla_idx" ON "tickets"("tenantId", "isNationalSla");

-- CreateIndex
CREATE INDEX "tickets_tenantId_createdAt_idx" ON "tickets"("tenantId", "createdAt");
