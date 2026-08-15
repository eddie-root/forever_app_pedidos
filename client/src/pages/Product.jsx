import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"
import api from "../utils/api";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30;
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/api/products/list");
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        toast.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // lógica de Busca e Filtragem
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  // Resetar página quando a busca muda
  useEffect(()=> {
    setCurrentPage(1)
  },[search])

  // Lógica de Paginação 
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = useMemo(()=> {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredProducts, currentPage]);

  const paginate = (pageNumber)=> setCurrentPage(pageNumber);

  if (loading) return <p className="p-6 text-center text-gray-500">Carregando produtos...</p>;

  return (
    <div className='no-scrollbar flex-1 h-[85vh] overflow-y-scroll'>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Lista de Produtos ({ filteredProducts.length })</h1>

        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-8 px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">Nenhum produto encontrado.</p>
          )}

          {currentItems.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-50 flex items-center justify-center relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-gray-300 text-xs uppercase font-bold">Sem imagem</div>
                )}
                <div className="absolute top-2 right-2 bg-primary text-white text-[12px] px-2 py-1 rounded-full font-bold">
                  {product.code}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{product.category?.name || 'Sem Categoria'}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">A partir de</span>
                    <span className="text-primary font-bold text-xl">
                      {product.prices && product.prices.length > 0 
                        ? `R$ ${(Math.min(...product.prices.map(p => p.price)) / 100).toFixed(2).replace('.', ',')}`
                        : 'N/A'}
                    </span>
                  </div>
                  
                  <button 
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
                    onClick={()=> navigate(`/products/${product.id}`)}
                  >
                    Selecionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center mt-8 gap-2'>
              <button
                onClick={()=> paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 cursor-pointer'
              >
                Anterior
              </button>
              <div className='flex gap-1'>
                {[...Array(totalPages)].map((_, i)=> (
                  <button
                    key={i + 1}
                    onClick={()=> paginate(i + 1)}
                    className={`w-10 h-10 rounded-md border ${currentPage === i + 1 
                      ? 'bg-primary text-white border-primary' 
                      : 'hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={()=> paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 cursor-pointer'
              >
                Próxima
              </button>
            </div>
          )}
        
      </div>
    </div>
  );
};

export default ProductList;
