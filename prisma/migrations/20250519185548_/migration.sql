-- CreateTable
CREATE TABLE "User" (
    "discord" TEXT NOT NULL,
    "guid" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("discord")
);

-- CreateTable
CREATE TABLE "Mods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "Mods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_key" ON "User"("discord");

-- CreateIndex
CREATE UNIQUE INDEX "Mods_name_version_key" ON "Mods"("name", "version");
