import prisma from '../prisma/client.js';
import cloudinary from '../configs/cloudinary.js';

// Add a new product
export const addProduct = async (req, res) => {
    // console.log("Recebendo requisição para adicionar produto...");
    // console.log("Body:", req.body);
    try {
        const { productData } = req.body;
        if (!productData) {
            console.error("Faltando productData no corpo da requisição.");
            return res.status(400).json({ success: false, message: "Faltando productData no corpo da requisição." });
        }
        const parsedData = JSON.parse(productData);
        // console.log("Dados parseados:", parsedData);

        const { code, name, description, category, isNewProduct, priceGroups } = parsedData;

        // Upload images to Cloudinary
        let imageUrl = '';
        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map(file => {
                return cloudinary.uploader.upload(file.path, {
                    folder: 'products',
                    transformation: [{ width: 800, height: 800, crop: "limit" }]
                });
            });

            const imageUploadResults = await Promise.all(imageUploadPromises);
            imageUrl = imageUploadResults[0]?.secure_url || '';
        }

        // 1. Find or create Category
        let categoryId;
        const existingCategory = await prisma.category.findFirst({ where: { name: category } });
        if (existingCategory) {
            categoryId = existingCategory.id;
        } else {
            const newCategory = await prisma.category.create({ data: { name: category } });
            categoryId = newCategory.id;
        }

        // 2. Upsert Product (create if it doesn't exist, update if it does)
        const product = await prisma.product.upsert({
            where: { code: code },
            update: {
                name,
                description,
                isNewProduct,
                // Keep the old image if no new image is provided
                image: imageUrl || undefined, 
                categoryId: categoryId,
            },
            create: {
                code,
                name,
                description,
                isNewProduct,
                image: imageUrl,
                categoryId: categoryId,
            }
        });

        // 3. Handle Price Groups (Structures), Materials and PriceCombinations
        // Clear existing combinations for this product to avoid stale data
        await prisma.priceCombination.deleteMany({ where: { productId: product.id } });

        for (const group of priceGroups) {
            let structure;
            const structureName = (group.name || '').trim() || 'Padrão';
            const existingStructure = await prisma.structure.findFirst({ where: { name: structureName } });
            if (existingStructure) {
                structure = existingStructure;
            } else {
                structure = await prisma.structure.create({ data: { name: structureName } });
            }

            for (const [materialName, price] of Object.entries(group.prices)) {
                let material;
                const existingMaterial = await prisma.material.findFirst({ where: { name: materialName } });
                if (existingMaterial) {
                    material = existingMaterial;
                } else {
                    material = await prisma.material.create({ data: { name: materialName } });
                }

                await prisma.priceCombination.create({
                    data: {
                        productId: product.id,
                        structureId: structure.id,
                        materialId: material.id,
                        price: price,
                    }
                });
            }
        }

        res.json({ success: true, message: "Product added successfully", product });
    } catch (error) {
        console.error("Erro no addProduct:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                success: false, 
                message: "Já existe um produto cadastrado com este código.",
                code: 'P2002' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a product by its ID
export const productById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                prices: {
                    include: {
                        structure: true,
                        material: true,
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Produto não encontrado" });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a list of all products
export const productList = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                prices: {
                    include: {
                        structure: true,
                        material: true,
                    }
                }
            }
        });
        res.json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ success: false, message: "Produto não encontrado" });
        }

        if (product.image) {
            const url = product.image;
            const parts = url.split('/');
            const publicIdWithExtension = parts.slice(parts.indexOf('products')).join('/');
            const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
            await cloudinary.uploader.destroy(publicId);
        }

        await prisma.priceCombination.deleteMany({ where: { productId } });
        await prisma.product.delete({ where: { id: productId } });

        res.json({ success: true, message: "Produto deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);
        const { productData, imagesToRemove } = req.body;
        const parsedData = JSON.parse(productData);
        const { name, description, category, isNewProduct, priceGroups } = parsedData;

        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Produto não encontrado" });
        }

        let imageUrl = existingProduct.image;

        // Handle image removal from frontend
        if (imagesToRemove) {
            const parsedImagesToRemove = JSON.parse(imagesToRemove);
            if (parsedImagesToRemove.length > 0 && existingProduct.image && parsedImagesToRemove.includes(existingProduct.image)) {
                const url = existingProduct.image;
                const parts = url.split('/');
                const publicIdWithExtension = parts.slice(parts.indexOf('products')).join('/');
                const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
                await cloudinary.uploader.destroy(publicId);
                imageUrl = null; // Set to null if image was removed
            }
        }

        // Handle new image upload
        if (req.files && req.files.length > 0) {
            // If we have an image and didn't remove it yet (though usually we'd remove it if we replace it)
            if (imageUrl) {
                const url = imageUrl;
                const parts = url.split('/');
                const publicIdWithExtension = parts.slice(parts.indexOf('products')).join('/');
                const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
                await cloudinary.uploader.destroy(publicId).catch(err => console.error("Cloudinary destroy error:", err));
            }

            const imageUploadResults = await cloudinary.uploader.upload(req.files[0].path, {
                folder: 'products',
                transformation: [{ width: 800, height: 800, crop: "limit" }]
            });
            imageUrl = imageUploadResults.secure_url;
        }

        let categoryId;
        const existingCategory = await prisma.category.findFirst({ where: { name: category } });
        if (existingCategory) {
            categoryId = existingCategory.id;
        } else {
            const newCategory = await prisma.category.create({ data: { name: category } });
            categoryId = newCategory.id;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                description,
                isNewProduct,
                image: imageUrl,
                categoryId: categoryId,
            }
        });

        await prisma.priceCombination.deleteMany({ where: { productId } });

        for (const group of priceGroups) {
            let structure;
            const structureName = (group.name || '').trim() || 'Padrão';
            const existingStructure = await prisma.structure.findFirst({ where: { name: structureName } });
            if (existingStructure) {
                structure = existingStructure;
            } else {
                structure = await prisma.structure.create({ data: { name: structureName } });
            }

            for (const [materialName, price] of Object.entries(group.prices)) {
                let material;
                const existingMaterial = await prisma.material.findFirst({ where: { name: materialName } });
                if (existingMaterial) {
                    material = existingMaterial;
                } else {
                    material = await prisma.material.create({ data: { name: materialName } });
                }

                await prisma.priceCombination.create({
                    data: {
                        productId: updatedProduct.id,
                        structureId: structure.id,
                        materialId: material.id,
                        price: price,
                    }
                });
            }
        }

        res.json({ success: true, message: "Produto atualizado com sucesso", product: updatedProduct });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search for a product
export const searchProduct = async (req, res) => {
    try {
        const { query } = req.query;
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { code: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ]
            },
            include: {
                category: true,
                prices: {
                    include: {
                        structure: true,
                        material: true,
                    }
                }
            }
        });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
