import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';

// Register User: /api/user/createUser
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // findOne({ email }) → findUnique
        const userExists = await prisma.user.findUnique({ 
            where: { email } 
        })

        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                role
            }
        })
        
        const { password: _, ...userWithoutPassword } = user
        res.status(201).json(userWithoutPassword)

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Listar usuário
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        })
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Editar usuário
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, password, role } = req.body

        let data = {
            name,
            email,
            role
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10)
            data.password = hashedPassword
        }

        const user = await prisma.user.update({ 
            where: { id: Number(id) },
            data
        });

        const { password: _, ...userWithoutPassword } = user
        res.json(userWithoutPassword)

    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};


// Deletar usuário 
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        await prisma.user.delete({
            where: { id: Number(id) }
        })

        res.json({ message: 'Usuário deletado' })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message });
    }
}