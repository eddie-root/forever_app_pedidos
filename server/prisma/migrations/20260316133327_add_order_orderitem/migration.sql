-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "numberPedido" TEXT,
    "userId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "term" TEXT,
    "typeShipping" TEXT,
    "carrying" TEXT,
    "observations" TEXT,
    "totalWithoutDiscounts" INTEGER NOT NULL,
    "totalWithDiscounts" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRE_PEDIDO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "cod" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "colorFabrics" TEXT,
    "discount1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceList" INTEGER NOT NULL,
    "priceWithDiscount" INTEGER NOT NULL,
    "priceTotalWithoutDisc" INTEGER NOT NULL,
    "priceTotalWithDisc" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_numberPedido_key" ON "Order"("numberPedido");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientPedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
