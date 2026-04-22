-- CreateTable
CREATE TABLE "Grupo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataQuarta" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Integrante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "alimento" TEXT NOT NULL,
    "grupoId" INTEGER NOT NULL,
    CONSTRAINT "Integrante_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_dataQuarta_key" ON "Grupo"("dataQuarta");
