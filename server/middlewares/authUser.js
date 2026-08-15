import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        let { token } = req.headers;
        
        // Se não tiver o header 'token', tenta o 'authorization'
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.json({ success: false, message: 'Não autorizado, login novamente' });
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = token_decode;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export default authUser;
