import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const EditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: '',
        description: '',
        priceGroups: [{ name: '', prices: {} }],
        isNewProduct: false,
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]); 
    const [imagesToRemove, setImagesToRemove] = useState([]); 

    const coverages = [
        'Vinil', 'Poliester', 'Space', 'Cec-Stilo', 'Grid', 'Politex', 'Mescla', 'Grani', 'Liv', 'Haven',
        'couro Natural', 'Colorida', 'PP', 'Emb. Multiplo de 4', 'Venda'
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/api/products/${id}`);
                if (data.success) {
                    const productData = data.product;
                    
                    const priceGroupsMap = {};
                    productData.prices.forEach(p => {
                        const structureName = p.structure.name;
                        if (!priceGroupsMap[structureName]) {
                            priceGroupsMap[structureName] = {
                                name: structureName,
                                prices: {}
                            };
                        }
                        priceGroupsMap[structureName].prices[p.material.name] = (p.price / 100).toFixed(2);
                    });

                    const formattedPriceGroups = Object.values(priceGroupsMap);

                    setProduct(productData);
                    setFormData({
                        code: productData.code,
                        name: productData.name,
                        category: productData.category.name,
                        description: productData.description || '',
                        priceGroups: formattedPriceGroups,
                        isNewProduct: productData.isNewProduct || false,
                    });
                    setExistingImages(productData.image ? [productData.image] : []);
                } else {
                    toast.error('Produto não encontrado.');
                    navigate('/admin/list-products');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Erro ao carregar produto.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const handlePriceInput = (groupIndex, coverage, rawValue) => {
        let value = rawValue.replace(/\D/g, "");
        if (value === "") value = "0";
        const numericValue = parseInt(value, 10) / 100;
        const formattedValue = numericValue.toFixed(2);
        handlePriceChange(groupIndex, coverage, formattedValue);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        setNewImages(prev => [...prev, ...files]);
    };

    const removeExistingImage = (index) => {
        const imageToRemove = existingImages[index];
        setImagesToRemove(prev => [...prev, imageToRemove]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = {
                name: formData.name.trim(),
                 // O .replace(/[\r\n]/g, " ") remove quebras de linha e retornos de carro
                category: formData.category.trim().replace(/[\r\n]/g, " "),
                priceGroups: formData.priceGroups.map(group => ({
                    name: group.name.trim(),
                    prices: Object.entries(group.prices).reduce((acc, [key, value]) => {
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue) && numericValue > 0) {
                            acc[key] = Math.round(numericValue * 100);
                        }
                        return acc;
                    }, {})
                })).filter(group => Object.keys(group.prices).length > 0),
                description: formData.description.trim().replace(/[\r\n]/g, " "),
                isNewProduct: formData.isNewProduct,
            };

            const formDataToSend = new FormData();
            formDataToSend.append('productData', JSON.stringify(productData));
            formDataToSend.append('imagesToRemove', JSON.stringify(imagesToRemove));
            newImages.forEach(file => formDataToSend.append('images', file));

            const { data } = await api.put(`/api/products/update/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                toast.success('Produto atualizado com sucesso!');
                navigate('/admin/list-products');
            } else {
                toast.error(data.message || 'Erro ao atualizar produto');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !product) {
        return <div className="p-8 text-center text-gray-500">Carregando dados do produto...</div>;
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Editar Produto</h1>
                    <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">ID: {id}</span>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    {/* INFORMAÇÕES GERAIS */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Informações Gerais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código (Não editável)</label>
                                <input type="text" name="code" value={formData.code} disabled className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Linha / Categoria *</label>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Ex: Linha Yon, Linha Light..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Detalhes técnicos do produto..."></textarea>
                            </div>
                            <div className='flex items-center gap-2 pt-2 md:col-span-2'>
                                <input type="checkbox" id='isNewProduct' name='isNewProduct' checked={formData.isNewProduct} onChange={handleChange} className='w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary' />
                                <label htmlFor='isNewProduct' className="text-sm font-medium text-gray-700 cursor-pointer">Marcar como Novo Lançamento</label>
                            </div>
                        </div>
                    </div>

                    {/* GRUPOS DE PREÇOS */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-700">Grupos de Preços</h2>
                            <button type="button" onClick={addPriceGroup} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">+ Adicionar Grupo</button>
                        </div>
                        {formData.priceGroups.map((group, index) => (
                            <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 relative space-y-4">
                                {formData.priceGroups.length > 1 && (
                                    <button type="button" onClick={() => removePriceGroup(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors text-sm font-medium">Remover Grupo</button>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo <span className="text-xs font-normal text-gray-400">(Deixe vazio para 'Padrão')</span></label>
                                    <input type="text" value={group.name} onChange={(e) => handlePriceGroupChange(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-primary" placeholder="Padrão" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {coverages.map((cov) => (
                                        <div key={cov} className="space-y-1">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 truncate">{cov}</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-gray-400 text-[10px]">R$</span>
                                                <input type="text" value={group.prices[cov] || ''} onChange={(e) => handlePriceInput(index, cov, e.target.value)} className="w-full pl-6 pr-1 py-1 border border-gray-200 rounded text-xs text-right outline-none focus:border-primary" placeholder="0,00" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* IMAGENS */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Imagens do Produto</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {/* Imagens já existentes no Cloudinary */}
                            {existingImages.map((img, index) => (
                                <div key={index} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden bg-gray-50 group">
                                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" title="Remover imagem existente">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {/* Novas imagens selecionadas */}
                            {newImages.map((file, index) => (
                                <div key={index} className="relative aspect-square border border-primary/30 rounded-lg overflow-hidden bg-gray-50 group">
                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white py-0.5 text-center">Nova Imagem</div>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary cursor-pointer transition-all bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs font-medium">Upload</span>
                                <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* BOTÕES DE AÇÃO */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/admin/list-products')} className="px-8 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-10 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold shadow-sm">
                            {loading ? 'Processando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;