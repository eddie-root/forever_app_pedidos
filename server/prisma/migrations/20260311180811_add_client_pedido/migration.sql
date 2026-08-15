-- CreateTable
CREATE TABLE "ClientPedido" (
    "id" SERIAL NOT NULL,
    "rSocial" TEXT NOT NULL,
    "nFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "inscEstadual" TEXT,
    "suframa" TEXT DEFAULT '',
    "dateFoundation" TEXT DEFAULT '',
    "address" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "contact" TEXT DEFAULT '',
    "cellPhone" TEXT DEFAULT '',
    "phone" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "emailNfe" TEXT DEFAULT '',
    "contactFinan" TEXT DEFAULT '',
    "phoneFinan" TEXT DEFAULT '',
    "emailFinan" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPedido_cnpj_key" ON "ClientPedido"("cnpj");
