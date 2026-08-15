
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import OrderContext from '../context/OrderContext';
import { calculateItemDiscount } from '../utils/discount';
import formatCurrency from '../utils/money';

const CreatePreOrder = () => {
  const navigate = useNavigate();
  const { cartItems, getDiscountedTotal, currency, clearCart, itemOptions, itemDiscounts } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { finalizePreOrder, loading: orderLoading, error: orderError } = useContext(OrderContext);

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [prazo, setPrazo] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [observation, setObservation] = useState('');
 
  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      toast.error('Você precisa estar logado para criar um pedido.');
      navigate('/login');
    }
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio.');
      navigate('/my-orders');
    }
  }, [user, cartItems, navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/api/client/getAll');
        if (response.data.success) {
          setClients(response.data.clients);
        }
      } catch (error) {
        toast.error('Falha ao buscar clientes.');
        console.error("Error fetching clients:", error);
      }
    };
    if (user) { // Only fetch clients if user is logged in
      fetchClients();
    }
  }, [user]);

  const filteredClients = clients.filter(client =>
    client.rSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj.includes(searchTerm)
  );

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchTerm('');
  };

  const handleCreateOrder = async () => {
    if (!selectedClient) {
      return toast.error('Por favor, selecione um cliente.');
    }
    if (!prazo || !transportadora) {
      return toast.error('Preencha o prazo e a transportadora.');
    }

    const orderData = {
      client: selectedClient._id, // Sending the whole client object as requested
      user: { // Sending user name as requested
        name: user.name,
        id: user._id
      },
      products: cartItems.map(item => {
        const key = `${item.product._id}-${item.assento}`;
        const options = itemOptions[key] || {};
        const discounts = itemDiscounts[key] || {};
        const totalPriceAfterDiscount = calculateItemDiscount(
          item.price * item.quantity,
          discounts.discount1,
          discounts.discount2,
          discounts.discount3,
          discounts.discount4
        );

        return {
          productId: item.product._id,
          codp: item.product.codp,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          new_price: totalPriceAfterDiscount, // Adding new_price to satisfy the schema
          totalPriceAfterDiscount,
          discounts,
          description: item.product.description, // Sending description as requested
          base: item.priceGroupName, // Sending base as requested
          tela: options.tela,
          revestimento: options.revestimento,
        };
      }),
      totalAmount: getDiscountedTotal(),
      prazo,
      transportadora,
      observation,
    };

    const response = await finalizePreOrder(orderData);

    if (response.success) {
      toast.success('Pré-pedido criado com sucesso!');
      clearCart();
      navigate('/my-orders');
    } else {
      toast.error(response.message || 'Falha ao criar o pré-pedido.');
    }
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-8">Criar Pré-Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Coluna da Esquerda: Cliente e Detalhes do Pedido */}
        <div>
          {/* Seleção de Cliente */}
          <div className="bg-white p-6 border rounded-lg mb-8">
            <h2 className="text-xl font-medium mb-4">1. Selecione o Cliente</h2>
            <input
              type="text"
              placeholder="Buscar por Razão Social ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            {searchTerm && (
              <ul className="border rounded-md max-h-60 overflow-y-auto">
                {filteredClients.length > 0 ? filteredClients.map(client => (
                  <li
                    key={client._id}
                    onClick={() => handleSelectClient(client)}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="font-semibold">{client.rSocial}</p>
                    <p className="text-sm text-gray-600">{client.cnpj}</p>
                  </li>
                )) : <li className="p-3 text-gray-500">Nenhum cliente encontrado.</li>}
              </ul>
            )}
            {selectedClient && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedClient.rSocial}</h3>
                <p><strong>CNPJ:</strong> {selectedClient.cnpj}</p>
                <p><strong>Endereço:</strong> {`${selectedClient.address}, ${selectedClient.city}`}</p>
                <button onClick={() => setSelectedClient(null)} className="text-red-500 text-sm mt-2">Limpar seleção</button>
              </div>
            )}
          </div>

          {/* Detalhes Adicionais do Pedido */}
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-xl font-medium mb-4">2. Detalhes do Pedido</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Prazo de Pagamento"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Transportadora"
                value={transportadora}
                onChange={(e) => setTransportadora(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <textarea
                placeholder="Observações..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full p-2 border rounded-md h-24"
              />
            </div>
          </div>
        </div>


        {/* Coluna da Direita: Resumo do Carrinho */}
        <div className="bg-gray-50 p-6 border rounded-lg">
          <h2 className="text-xl font-medium mb-4">3. Resumo dos Produtos</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cartItems.map(item => {
                 const key = `${item.product._id}-${item.assento}`;
                 const options = itemOptions[key] || {};
                return(
              <div key={`${item.product._id}-${item.assento}`} className="flex justify-between items-start border-b pb-2">
                <div>
                  <p className="font-semibold">{item.product.subcategory}</p>
                  <p className="text-sm text-gray-600">{item.product.codp}</p>
                  <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                  {options.tela && <p className="text-sm text-gray-600">Tela: {options.tela}</p>}
                  {options.revestimento && <p className="text-sm text-gray-600">Revestimento: {options.revestimento}</p>}
                </div>
                <p className="font-medium">{currency} {formatCurrency(item.price * item.quantity)}</p>
              </div>
            )})}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-xl font-bold">
              <span>Total com Descontos:</span>
              <span>{currency} {formatCurrency(getDiscountedTotal())}</span>
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={!selectedClient || cartItems.length === 0 || orderLoading}
              className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium rounded-lg hover:bg-primary-dull transition disabled:bg-gray-400"
            >
              {orderLoading ? 'Criando Pedido...' : 'Confirmar e Criar Pedido'}
            </button>
            {orderError && <p className="text-red-500 text-sm mt-2">{orderError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePreOrder;
