import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import formatCurrency from '../utils/money.js';
import { useCart } from '../context/CartContext.jsx';
import api from '../utils/api.js';
import { TelasData } from '../data/telas.js';

const ProductPage = () => {

    const { id } = useParams();
    const { addToCart } = useCart()
    
    const [ productData, setProductData ] = useState(null)
    const [ loading, setLoading ] = useState(true);
    const [ image, setImage ] = useState('')
    const [ material, setMaterial ] = useState('');
    const [ selectedTelaType, setSelectedTelaType ] = useState('');
    const [ selectedTelaColor, setSelectedTelaColor ] = useState('');
    const [ selectedPriceGroup, setSelectedPriceGroup ] = useState(null); 
    const [ quantity, setQuantity ] = useState(1);

    const fetchProductData = async (id)=> {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/products/${id}`);
            if (data.success) {
                const product = data.product;

                // Group prices by structure
                const priceGroupsMap = {};
                product.prices.forEach(p => {
                    const structureName = p.structure.name || 'Padrão';
                    if (!priceGroupsMap[structureName]) {
                        priceGroupsMap[structureName] = {
                            name: structureName,
                            prices: {}
                        };
                    }
                    priceGroupsMap[structureName].prices[p.material.name] = p.price;
                });

                const priceGroups = Object.values(priceGroupsMap);

                // Transform description (split into list by newline)
                const descriptionList = product.description.split('\n').filter(line => line.trim() !== '');

                const transformedProduct = {
                    ...product,
                    priceGroups,
                    descriptionList,
                    image: product.image ? [product.image] : []
                };

                setProductData(transformedProduct);
                if (transformedProduct.image.length > 0) {
                    setImage(transformedProduct.image[0]);
                }

                if (priceGroups.length > 0) {
                    setSelectedPriceGroup(priceGroups[0]);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar produto:", error);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(()=> {
        fetchProductData(id)
    },[id])

    const handlePriceGroupChange = (e) => {
        const groupName = e.target.value;
        const group = productData.priceGroups.find(g => g.name === groupName);
        setSelectedPriceGroup(group);
        setMaterial(''); 
    };

    const getCurrentPrice = () => {
        if (selectedPriceGroup && material) {
            const price = selectedPriceGroup.prices[material];
            return price ? formatCurrency(price) : 'N/A';
        }
        return 'Selecione um revestimento';
    };

    const getCurrentPriceValue = () => {
        if (selectedPriceGroup && material) {
            return selectedPriceGroup.prices[material];
        }
        return 0; 
    };

    const handleAddToCart = () => {
        if (material) {
            let telaInfo = null;
            if (selectedTelaType && selectedTelaColor) {
                telaInfo = `${selectedTelaType} - ${selectedTelaColor}`;
            }

            addToCart(
                productData.id, 
                productData.name, 
                productData.code, 
                image, 
                quantity, 
                getCurrentPriceValue(), 
                material, 
                selectedPriceGroup.name,
                telaInfo,
                productData.description
            );
            alert("Produto adicionado ao pedido!");
        } else {
            alert("Por favor, selecione um revestimento.");
        }
    }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-pulse text-gray-500 font-medium">Carregando produto...</div>
  </div>;
  
  if (!productData) return <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-gray-500 font-medium">Produto não encontrado.</div>
  </div>;

  return (
      
      <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100' >
           
            {/* ----------  Product Data ---------- */}
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/* ----------  Product Images ---------- */}
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto  justify-between sm:justify-normal sm:w-[18.7%] w-full'>
                        {
                            productData.image.map((item, index)=> (
                                <img 
                                    onClick={()=> setImage(item)}
                                    src={item} key={index} 
                                    className={`w-[24%] sm:w-full sm:mb-3 border-2 cursor-pointer rounded transition-all ${image === item ? 'border-primary' : 'border-transparent hover:border-gray-200'}`} alt=""
                                />
                            ))
                        }
                    </div>
                    <div className='w-full sm:w-[60%]'>
                    <img 
                        className='w-full h-auto rounded-xl shadow-sm'   
                        src={image} alt="" 
                    />
                    </div>
                </div>
                {/* ----------  Product Info ---------- */}

                <div className='flex-1'>
                    <h1 className='font-bold text-3xl text-gray-800'>{productData.name}</h1>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-400 font-medium uppercase text-xs tracking-wider">Código</span>
                        <p className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-sm">{productData.code}</p>
                    </div>
                    
                    {/* --- Structure Selector --- */}
                    {productData.priceGroups && productData.priceGroups.length > 0 && (
                        <div className="mt-8">
                            <label htmlFor="price-group-selector" className="text-sm font-bold text-gray-500 uppercase tracking-tight">Estrutura / Modelo</label>
                            <select 
                                id="price-group-selector"
                                value={selectedPriceGroup ? selectedPriceGroup.name : ''}
                                onChange={handlePriceGroupChange}
                                className="w-full p-3 mt-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm transition-all"
                            >
                                {productData.priceGroups.map(group => (
                                    <option key={group.name} value={group.name}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* --- Opcional: Telas Selector --- */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-tight mb-3">Opções de Tela (Opcional)</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tipo de Tela</label>
                                <select 
                                    value={selectedTelaType}
                                    onChange={(e) => {
                                        setSelectedTelaType(e.target.value);
                                        setSelectedTelaColor('');
                                    }}
                                    className="w-full p-2 border border-gray-200 rounded-md bg-white text-sm"
                                >
                                    <option value="">Escolher tela</option>
                                    {Object.keys(TelasData).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedTelaType && (
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Cor da Tela</label>
                                    <select 
                                        value={selectedTelaColor}
                                        onChange={(e) => setSelectedTelaColor(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-md bg-white text-sm"
                                    >
                                        <option value="">Escolher cor</option>
                                        {TelasData[selectedTelaType].map(tela => (
                                            <option key={tela.code} value={`${tela.code} - ${tela.name}`}>
                                                {tela.code} - {tela.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <span className="text-xs font-bold text-primary uppercase block mb-1">Preço Unitário</span>
                        <p className="text-3xl font-black text-primary">
                            {getCurrentPrice()}
                        </p>
                    </div>
    
                    <div className="mt-8">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-tight mb-3">Características</p>
                        <ul className="space-y-2">
                           {productData.descriptionList.map((desc, index) => (
                              <li key={index} className="flex items-start gap-2 text-gray-600">
                                <span className="text-primary mt-1">•</span>
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* --- Coverages Section --- */}
                    {selectedPriceGroup && (
                        <div className="mt-8">
                            <p className='text-sm font-bold text-gray-500 uppercase tracking-tight mb-4'>Revestimentos Disponíveis</p> 
                            <div className='flex items-center flex-wrap gap-2 w-full'>
                                {Object.keys(selectedPriceGroup.prices).map((mName, index)=> (
                                    <button
                                        className={`py-2 px-5 text-sm font-medium rounded-full border-2 transition-all ${mName === material ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"}`}
                                        onClick={()=> setMaterial(mName)}
                                        key={index}
                                    >
                                    {mName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-white h-14">
                            <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-5 h-full hover:bg-gray-50 text-gray-500 transition-colors">
                                <span className="text-xl font-bold">−</span>
                            </button>
                            <span className="px-6 font-bold text-gray-700 min-w-[60px] text-center">{quantity}</span>
                            <button onClick={() => setQuantity(prev => prev + 1)} className="px-5 h-full hover:bg-gray-50 text-gray-500 transition-colors">
                                <span className="text-xl font-bold">+</span>
                            </button>
                        </div>

                        <button 
                            onClick={handleAddToCart} 
                            className="flex-1 h-14 cursor-pointer font-bold bg-primary text-white hover:bg-opacity-90 hover:shadow-lg active:transform active:scale-[0.98] transition-all rounded-xl shadow-md uppercase tracking-wide text-sm" 
                        >
                            Adicionar ao Pedido
                        </button>
                    </div>
                </div>
            </div>
        
    </div>
  ) 
}

export default ProductPage;