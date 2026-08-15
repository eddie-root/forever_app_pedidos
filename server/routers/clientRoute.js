import express from 'express';
import { 
    createClient, 
    getClients, 
    getClientById, 
    updateClient, 
    deleteClient 
} from '../controllers/clientController.js';


const clientRouter = express.Router();

clientRouter.post('/', createClient);
clientRouter.get('/', getClients);
clientRouter.get('/:id', getClientById);
clientRouter.put('/:id', updateClient);
clientRouter.delete('/:id', deleteClient);

export default clientRouter;
