-- CreateTable
CREATE TABLE "User" (
    "discord" TEXT NOT NULL PRIMARY KEY,
    "guid" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Mods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "role" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_key" ON "User"("discord");

-- CreateIndex
CREATE UNIQUE INDEX "Mods_name_version_key" ON "Mods"("name", "version");
