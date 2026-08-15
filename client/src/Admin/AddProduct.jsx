import React, { useContext, useState } from 'react';
import AppContext from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const AddProduct = () => {
    const { navigate } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        codp: '',
        name: '',
        category: '',
        subcategory: '',
        description: [''],
        priceGroups: [{ name: '', prices: {} }], // <-- Changed state
        images: [],
        isNewProduct: false,
    });

    // List of available coverages
    const coverages = [
        'Vinil', 'Poliester', 'Space', 'Cec-Stilo', 'Grid', 'Politex', 'Mescla', 'Grani', 'Liv', 'Haven',
        'couro Natural', 'Colorida', 'PP', 'Emb. Multiplo de 4', 'Venda'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleDescriptionChange = (index, value) => {
        const newDescription = [...formData.description];
        newDescription[index] = value;
        setFormData((prev) => ({ ...prev, description: newDescription }));
    };

    const addDescriptionField = () => {
        setFormData((prev) => ({ ...prev, description: [...prev.description, ''] }));
    };

    const removeDescriptionField = (index) => {
        const newDescription = formData.description.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, description: newDescription }));
    };

    // --- New handlers for Price Groups ---
    const addPriceGroup = () => {
        setFormData((prev) => ({
            ...prev,
            priceGroups: [...prev.priceGroups, { name: '', prices: {} }],
        }));
    };

    const removePriceGroup = (index) => {
        const newPriceGroups = formData.priceGroups.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, priceGroups: newPriceGroups }));
    };

    const handlePriceGroupChange = (index, value) => {
        const newPriceGroups = [...formData.priceGroups];
        newPriceGroups[index].name = value;
        setFormData((prev) => ({ ...prev, priceGroups: newPriceGroups }));
    };

    const handlePriceChange = (groupIndex, coverage, value) => {
        const newPriceGroups = [...formData.priceGroups];
        newPriceGroups[groupIndex].prices[coverage] = value;
        setFormData((prev) => ({ ...prev, priceGroups: newPriceGroups }));
    };
    // --- End of new handlers ---


    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    };

    const removeImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, images: newImages }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // --- Updated productData structure ---
            const productData = {
                codp: formData.codp.trim(),
                name: formData.name.trim(),
                category: formData.category.trim(),
                subcategory: formData.subcategory.trim(),
                priceGroups: formData.priceGroups
                    .map(group => ({
                        name: group.name,
                        prices: Object.entries(group.prices).reduce((acc, [key, value]) => {
                            if (value !== '' && !isNaN(Number(value))) {
                                acc[key] = Number(value) * 100; // Convert to cents
                            }
                            return acc;
                        }, {})
                    }))
                    .filter(group => group.name.trim() !== '' && Object.keys(group.prices).length > 0),
                description: formData.description.filter((desc) => desc.trim() !== ''),
                isNewProduct: formData.isNewProduct,
            };

            if (productData.priceGroups.length === 0) {
                toast.error('Adicione pelo menos um grupo de preços com valores.');
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('productData', JSON.stringify(productData));

            formData.images.forEach((file) => {
                formDataToSend.append('images', file);
            });

            const { data } = await api.post('/api/product/add', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success('Produto adicionado com sucesso!');
                navigate('/admin/product-list');
            } else {
                toast.error(data.message || 'Erro ao adicionar produto');
            }

        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            if (error.response?.data?.code === 11000) {
                toast.error('Este código de produto já existe. Por favor, use outro código.');
            } else {
                toast.error(error.response?.data?.message || 'Erro ao adicionar produto');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between'>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium">Adicionar Novo Produto</h1>
                    <button
                        onClick={() => navigate('/admin/product-list')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Voltar
                    </button>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    {/* Dados Básicos (No changes here) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Dados Básicos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                                <input
                                    type="text"
                                    name="codp"
                                    value={formData.codp}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SubCategoria *</label>
                                <input
                                    type="text"
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className='flex items-center gap-2'>
                                <input 
                                    type="checkbox"
                                    id='isNewProduct'
                                    name='isNewProduct'
                                    checked={formData.isNewProduct}
                                    onChange={handleChange}
                                    className='rounded'
                                />
                                <label className="block text-sm font-medium text-gray-700 mb-1">Novo Lançamento</label>
                                
                            </div>
                        </div>
                    </div>

                    {/* --- New Price Groups Section --- */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Grupos de Preços e Revestimentos</h2>
                        <div className="space-y-6">
                            {formData.priceGroups.map((group, index) => (
                                <div key={index} className="p-4 border rounded-md space-y-4 relative">
                                    {formData.priceGroups.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePriceGroup(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        >
                                            Remover Grupo
                                        </button>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome do Grupo de Preços (ex: Estrutura Preta)
                                        </label>
                                        <input
                                            type="text"
                                            value={group.name}
                                            onChange={(e) => handlePriceGroupChange(index, e.target.value)}
                                            placeholder="Nome do Grupo"
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {coverages.map((coverage) => (
                                            <div key={coverage}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Preço {coverage}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={group.prices[coverage] || ''}
                                                    onChange={(e) => handlePriceChange(index, coverage, e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addPriceGroup}
                                className="text-primary hover:text-primary/80"
                            >
                                + Adicionar outro grupo de preços
                            </button>
                        </div>
                    </div>

                    {/* Descrição (No changes here) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Descrição</h2>
                        <div className="space-y-4">
                            {formData.description.map((desc, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={desc}
                                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                        placeholder="Adicione uma descrição"
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDescriptionField(index)}
                                            className="px-3 py-2 text-red-500 hover:text-red-700"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addDescriptionField}
                                className="text-primary hover:text-primary/80"
                            >
                                + Adicionar descrição
                            </button>
                        </div>
                    </div>

                    {/* Imagens (No changes here) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Imagens</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <span className="text-gray-500">+ Adicionar imagem</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/product-list')}
                            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;