import prisma from '../prisma/client.js';
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const loginUser = async (req, res)=> {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(400).json({ message: "Usúario não encontrado" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Senha inválida" })
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}