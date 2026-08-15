-- CreateTable
CREATE TABLE "Tela" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tela_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tela_type_code_key" ON "Tela"("type", "code");
