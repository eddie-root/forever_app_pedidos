import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import './configs/cloudinary.js';
import userRouter from './routers/userRoute.js';
import productRouter from './routers/productRoute.js';
import orderRouter from './routers/orderRoute.js';
import clientRouter from './routers/clientRoute.js';

// app config
const app = express();
const port = process.env.PORT || 4000;


// Allow multiple origins
const allowedOrigins = ['http://localhost:5173'];

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: 
        allowedOrigins,
        credentials: true
}));

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/client', clientRouter)
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)

// app.use('/api/admin', adminRouter)
app.get('/', (req, res)=> res.send('API is Working'));

app.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`)
})
