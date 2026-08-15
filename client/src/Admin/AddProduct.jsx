import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiUrl from '../utils/api';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: '',
        description: '',
        priceGroups: [{ name: '', prices: {} }],
        images: [],
        isNewProduct: false,
    });

    const coverages = [
        'Vinil', 'Poliester', 'Space', 'Cec-Stilo', 'Grid', 'Politex', 'Mescla', 'Grani', 'Liv', 'Haven',
        'couro Natural', 'Tramma', 'PP', 'Emb. Multiplo de 4', 'Venda'
    ];

    const handlePriceInput = (groupIndex, coverage, rawValue) => {
        let value = rawValue.replace(/\D/g, "");
        if (value === "") value = "0";
        const numericValue = parseInt(value, 10) / 100;
        const formattedValue = numericValue.toFixed(2);
        handlePriceChange(groupIndex, coverage, formattedValue);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

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
            const productData = {
                code: formData.code.trim(),
                name: formData.name.trim(),
                // O .replace(/[\r\n]/g, " ") remove quebras de linha e retornos de carro
                category: formData.category.trim().replace(/[\r]/g, ""), // Remove carriage returns
                priceGroups: formData.priceGroups
                    .map(group => ({
                        name: group.name.trim(), 
                        prices: Object.entries(group.prices).reduce((acc, [key, value]) => {
                            const numericValue = parseFloat(value);
                            if (!isNaN(numericValue) && numericValue > 0) {
                                acc[key] = Math.round(numericValue * 100); 
                            }
                            return acc;
                        }, {})
                    }))
                    .filter(group => Object.keys(group.prices).length > 0),
                description: formData.description.trim().replace(/[\r]/g, ""), // ...restante
                isNewProduct: formData.isNewProduct,
            };

            if (productData.priceGroups.length === 0) {
                toast.error('Adicione pelo menos um valor de preço.');
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('productData', JSON.stringify(productData));
            formData.images.forEach((file) => formDataToSend.append('images', file));

            const { data } = await apiUrl.post('/api/products/add', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                toast.success('Produto adicionado com sucesso!');
                navigate('/admin/list-products');
            } else {
                toast.error(data.message || 'Erro ao adicionar produto');
            }
        } catch (error) {
            if (error.response?.data?.code === 'P2002') {
                toast.error('Este código de produto já existe.');
            } else {
                toast.error(error.response?.data?.message || 'Erro ao adicionar produto');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50'>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Novo Produto</h1>
                <form onSubmit={onSubmitHandler} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">Informações Gerais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código do Produto *</label>
                                <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: CAV-101" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Cadeira Cavaletti" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Linha / Categoria *</label>
                                <input 
                                    type="text" 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primary outline-none" 
                                    placeholder="Ex: Linha Yon, Linha Flip, Mesa de Reunião..." 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primary outline-none" placeholder="Detalhes técnicos..."></textarea>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type="checkbox" id='isNewProduct' name='isNewProduct' checked={formData.isNewProduct} onChange={handleChange} className='w-4 h-4 rounded text-primary' />
                            <label htmlFor='isNewProduct' className="text-sm font-medium text-gray-700">Marcar como Novo Lançamento</label>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-700">Grupos de Preços</h2>
                            <button type="button" onClick={addPriceGroup} className="text-sm text-blue-600 hover:underline font-medium">+ Adicionar Grupo</button>
                        </div>
                        {formData.priceGroups.map((group, index) => (
                            <div key={index} className="p-4 border rounded-md bg-gray-50 relative space-y-4">
                                {formData.priceGroups.length > 1 && (
                                    <button type="button" onClick={() => removePriceGroup(index)} className="absolute top-2 right-2 text-red-500 text-sm hover:font-bold">Remover</button>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo <span className="text-xs font-normal text-gray-500">(Opcional)</span></label>
                                    <input type="text" value={group.name} onChange={(e) => handlePriceGroupChange(index, e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none focus:border-primary" placeholder="Padrão" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {coverages.map((cov) => (
                                        <div key={cov}>
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 truncate">{cov}</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-gray-400 text-xs">R$</span>
                                                <input type="text" value={group.prices[cov] || ''} onChange={(e) => handlePriceInput(index, cov, e.target.value)} className="w-full pl-7 pr-1 py-1.5 border rounded text-xs text-right outline-none focus:border-primary" placeholder="0,00" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">Imagens do Produto</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative aspect-square border rounded overflow-hidden bg-gray-100">
                                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded border-gray-300">
                                <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
                                <span className="text-2xl text-gray-400">+</span>
                                <span className="text-xs text-gray-500 font-medium">Upload</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => navigate('/admin/list-products')} className="px-8 py-2 border rounded-md hover:bg-gray-100 font-medium transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-12 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold shadow-md transition-colors">{loading ? 'Salvando...' : 'Salvar Produto'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;