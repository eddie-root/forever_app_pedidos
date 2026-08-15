import { useParams } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import formatCurrency from '../utils/money.js';
import ProductContext from '../context/ProductContext.jsx';
import CartContext from '../context/CartContext.jsx';

const ProductDetails = () => {

    const { codp } = useParams();
    const { products } = useContext(ProductContext)
    const { addToCart, currency } = useContext(CartContext)
    
    const [ productData, setProductData ] = useState()
    const [ image, setImage ] = useState()
    const [ assentos, setAssentos ] = useState('');
    const [selectedPriceGroup, setSelectedPriceGroup] = useState(null); // New state for selected price group
    const [quantity, setQuantity] = useState(1);

    const fetchProductData = async (codp, products)=> {
        const product = products.find(item => item.codp === codp);
        if (product) {
            setProductData(product);
            setImage(product.image[0]);
            // Set the first price group as the default
            if (product.priceGroups && product.priceGroups.length > 0) {
                setSelectedPriceGroup(product.priceGroups[0]);
            }
        }
    }
    
    useEffect(()=> {
        fetchProductData(codp,products)
    },[codp, products])

    // Handler for when the user selects a different price group
    const handlePriceGroupChange = (e) => {
        const groupName = e.target.value;
        const group = productData.priceGroups.find(g => g.name === groupName);
        setSelectedPriceGroup(group);
        setAssentos(''); // Reset selected seat when group changes
    };

    // Determine the current price based on selected group and seat
    const getCurrentPrice = () => {
        if (selectedPriceGroup && assentos) {
            const price = selectedPriceGroup.prices[assentos];
            return price ? formatCurrency(price) : 'N/A';
        }
        return 'Selecione um revestimento';
    };

    // Get the raw numeric price for adding to cart
    const getCurrentPriceValue = () => {
        if (selectedPriceGroup && assentos) {
            return selectedPriceGroup.prices[assentos];
        }
        return 0; // Or handle as an error/invalid state
    };

    const handleAddToCart = () => {
        if (assentos) {
            addToCart(productData._id, quantity, getCurrentPriceValue(), assentos, selectedPriceGroup.name);
        } else {
            alert("Por favor, selecione um revestimento.");
        }
    }

  return productData ? (
      
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
                                    className='w-[24%] sm:w-full sm:mb-3 ' alt=""
                                />
                            ))
                        }
                    </div>
                    <div className='w-full sm:w-[60%]'>
                    <img 
                        className='w-full h-auto'   
                        src={image} alt="" 
                    />
                    </div>
                </div>
                {/* ----------  Product Info ---------- */}

                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        <span className="mt-1 text-gray-500 ">Codigo: </span>
                        <p className=" font-medium text-xl ml-2 mt-2">{productData.codp}</p>
                    </div>
                    
                    {/* --- New Price Group Selector --- */}
                    {productData.priceGroups && productData.priceGroups.length > 1 && (
                        <div className="mt-6">
                            <label htmlFor="price-group-selector" className="text-base font-medium">Selecione a Estrutura:</label>
                            <select 
                                id="price-group-selector"
                                value={selectedPriceGroup ? selectedPriceGroup.name : ''}
                                onChange={handlePriceGroupChange}
                                className="w-full p-2 mt-2 border rounded-md"
                            >
                                {productData.priceGroups.map(group => (
                                    <option key={group.name} value={group.name}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mt-6">
                        <p className="text-2xl font-medium">
                            {currency} {getCurrentPrice()}
                        </p>
                    </div>
    
                    <p className="text-base font-medium mt-6">About Product</p>
                        <ul className="list-disc ml-4 text-gray-600">
                           {productData.description.map((desc, index) => (
                              <li key={index}>{desc}</li>
                            ))}
                        </ul>
                    
                    {/* --- Coverages Section --- */}
                    {selectedPriceGroup && (
                        <div>
                            <p className='mt-6 text-gray-700 md:w-4/5'>Revestimentos Assentos:</p> 
                            <div className='flex items-center flex-wrap gap-3 w-full mt-4 cursor-pointer'>
                                {Object.keys(selectedPriceGroup.prices).map((assento, index)=> (
                                    <p
                                        className={` py-2 px-6 bg-primary/20 ${assento === assentos ? "bg-primary/50" : ""}`}
                                        onClick={()=> setAssentos(assento)}
                                        key={index}
                                    >
                                    {assento}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center mt-8 gap-4">
                        <div className="flex items-center border border-gray-300">
                            <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-4 py-2">-</button>
                            <span className="px-4 py-2">{quantity}</span>
                            <button onClick={() => setQuantity(prev => prev + 1)} className="px-4 py-2">+</button>
                        </div>
                    </div>
    
                    <div className="flex items-center mt-10 gap-4 text-base">
                        <button onClick={handleAddToCart} className="w-full py-3.5 cursor-pointer font-medium bg-gray-300 text-gray-700/90 hover:bg-gray-400 transition" >
                            ADICIONAR AO PEDIDO
                        </button>
                    </div>
                </div>
            </div>
        
    </div>
  ) : <div className='opacity-0'></div>
}

export default ProductDetails