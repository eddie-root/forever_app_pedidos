import express from 'express';
import { 
  createPreOrder, 
  getMyOrders, 
  getAllOrders, 
  getOrderById, 
  deleteOrder, 
  getOrderPdf 
} from '../controllers/orderController.js';
import authUser from '../middlewares/authUser.js';

const orderRouter = express.Router();

// Rota para criar um novo pré-pedido
orderRouter.post('/pre-order', authUser, createPreOrder);

// Rota para buscar os pedidos criados pelo usuário logado
orderRouter.get('/my-orders', authUser, getMyOrders);

// Rota para buscar todos os pedidos (admin)
orderRouter.get('/list', getAllOrders);

// Rota para buscar o PDF de um pedido
orderRouter.get('/:id/pdf', getOrderPdf);

// Rota para buscar um pedido pelo ID (admin)
orderRouter.get('/:id', getOrderById);

// Rota para deletar um pedido pelo ID (admin)
orderRouter.delete('/:id', authUser, deleteOrder);

export default orderRouter;