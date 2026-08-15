import express from 'express';
import { upload } from '../middlewares/multer.js';
import { addProduct, productById, productList, deleteProduct, updateProduct, searchProduct } from '../controllers/productController.js';

const productRouter = express.Router();

// Specific routes first
productRouter.post('/add', upload.array('images'), addProduct);
productRouter.get('/list', productList);
productRouter.get('/search', searchProduct);

// More specific routes
productRouter.put('/update/:id', upload.array('images'), updateProduct);

// Generic REST routes (ID based)
productRouter.get('/:id', productById);
productRouter.delete('/:id', deleteProduct); // simplified from /delete/:id

export default productRouter;
