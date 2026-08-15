import { PrismaClient } from "@prisma/client";
import { generateOrderPDF } from "../services/pdf.service.js";
import { company } from "../configs/company.js";

const prisma = new PrismaClient();

// GERAR NÚMERO DO PEDIDO (Timestamp + Random)
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(100 + Math.random() * 899); // 3 dígitos
  return `PED-${year}${month}${day}-${seconds}${random}`;
};

// CRIAR NOVO PEDIDO (Pré-Pedido)
export const createPreOrder = async (req, res) => {
  try {
    const { 
      userId, 
      clientId, 
      term, 
      typeShipping, 
      carrying, 
      observations, 
      items, 
      totalWithoutDiscounts, 
      totalWithDiscounts 
    } = req.body;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        numberPedido: orderNumber,
        userId: Number(userId),
        clientId: Number(clientId),
        term,
        typeShipping,
        carrying,
        observations,
        totalWithoutDiscounts: Math.round(totalWithoutDiscounts),
        totalWithDiscounts: Math.round(totalWithDiscounts),
        status: "PRE_PEDIDO",
        items: {
          create: items.map(item => ({
            cod: item.cod,
            name: item.name,
            description: item.description,
            colorTelas: item.colorTelas,
            structureName: item.structureName,
            materialName: item.materialName,
            discount1: Number(item.discount1),
            discount2: Number(item.discount2),
            discount3: Number(item.discount3),
            discount4: Number(item.discount4),
            quantity: Number(item.quantity),
            priceList: Math.round(item.priceList),
            priceWithDiscount: Math.round(item.priceWithDiscount),
            priceTotalWithoutDisc: Math.round(item.priceTotalWithoutDisc),
            priceTotalWithDisc: Math.round(item.priceTotalWithDisc)
          }))
        }
      },
      include: {
        items: true,
        client: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ success: false, error: "Erro ao criar pedido: " + error.message });
  }
};

// LISTAR MEUS PEDIDOS (Usuário Logado)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: {
        items: true,
        client: {
          select: { rSocial: true, nFantasia: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao buscar seus pedidos: " + error.message });
  }
};

// LISTAR TODOS OS PEDIDOS (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        client: {
          select: { rSocial: true, nFantasia: true }
        },
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao buscar todos os pedidos: " + error.message });
  }
};

// BUSCAR PEDIDO POR ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
        client: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!order) return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao buscar pedido: " + error.message });
  }
};

// ATUALIZAR STATUS DO PEDIDO
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao atualizar pedido: " + error.message });
  }
};

// DELETAR PEDIDO
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deletar itens primeiro (Cascade manual se não configurado no schema)
    await prisma.orderItem.deleteMany({ where: { orderId: Number(id) } });
    await prisma.order.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: "Pedido removido com sucesso" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao deletar pedido: " + error.message });
  }
};

// GERAR PDF DO PEDIDO
export const getOrderPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
        client: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    const pdf = await generateOrderPDF(order, company);

    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).json({ success: false, error: "Erro ao gerar PDF: " + error.message });
  }
};
