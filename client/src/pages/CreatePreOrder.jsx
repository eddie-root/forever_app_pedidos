import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useClient } from "../context/ClientContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import formatCurrency from "../utils/money";

const CreateOrder = () => {

  const {
    cartItems,
    totalWithoutDiscount,
    totalWithDiscount,
    clearCart
  } = useCart();

  const {
    selectedClient
  } = useClient();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [term, setTerm] = useState("");
  const [typeShipping, setTypeShipping] = useState("FOB");
  const [carrying, setCarrying] = useState("");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);

  if (!selectedClient) {
    return (
      <div className="container-page">
        <h1 className="text-2xl font-semibold mb-4">
          Nenhum cliente selecionado
        </h1>
        <button
          onClick={() => navigate("/clients")}
          className="btn-primary"
        >
          Selecionar Cliente
        </button>
      </div>
    );
  }

  const handleCreateOrder = async () => {
      if (loading) return;

      setLoading(true);
    
      if (!selectedClient || !selectedClient.id) {
        alert("Selecione um cliente antes de confirmar o pedido.");
        return;
      }

      if (!user || !user.id) {
        alert("Usuário não autenticado.");
        return;
      }
    
      if (cartItems.length === 0) {
        alert("Carrinho vazio.");
        return;
      }
    
      if (!term.trim()) {
        alert("Informe o prazo.");
        return;
      }
    
      if (!typeShipping) {
        alert("Selecione o tipo de frete.");
        return;
      }

    
        try {
    
            const payload = {
              userId: user.id,
              clientId: selectedClient.id,
              term,
              typeShipping,
              carrying,
              observations,
              totalWithoutDiscounts: totalWithoutDiscount,
              totalWithDiscounts: totalWithDiscount,
              items: cartItems.map(item => ({
                cod: item.code,
                name: item.name,
                description: item.description,
                colorTelas: item.tela || "N/A",
                structureName: item.structureName,
                materialName: item.materialName,
                quantity: item.quantity,
                discount1: item.discount1 || 0,
                discount2: item.discount2 || 0,
                discount3: item.discount3 || 0,
                discount4: item.discount4 || 0,
                priceList: item.priceList,
                priceWithDiscount: item.finalUnitPrice,
                priceTotalWithoutDisc: item.priceList * item.quantity,
                priceTotalWithDisc: item.finalTotalPrice
              }))
            };

            const { data } = await api.post("/api/orders/pre-order", payload);
        
            if (data.success) {
        
              clearCart();
        
              navigate(`/orders`);
        
            }
      
        } catch (error) {
          console.error(error);
          alert("Erro ao criar pedido.");
        }

        setLoading(false);
      
      };

  return (
    <div className="container-page">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold mb-8">Confirmar Pedido</h1>
        <button
          onClick={()=> navigate('/cart')}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          Voltar p/ Carrinho
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* 🔹 COLUNA ESQUERDA */}
        <div className="lg:col-span-2 space-y-6">

          {/* Cliente */}
          <div className="card">
            <h2 className="font-semibold mb-2">
              Cliente
            </h2>

            <p>{selectedClient.rSocial}</p>
            <p className="text-sm text-textSecondary">
              CNPJ: {selectedClient.cnpj}
            </p>
            <p className="text-sm text-textSecondary">
              Cidade: {selectedClient.city}
            </p>
          </div>

          {/* Dados Comerciais */}
          <div className="card space-y-4">

            <h2 className="font-semibold">
              Dados do Pedido
            </h2>

            <input
              type="text"
              placeholder="Prazo (ex: 28/56/84)"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <select
              value={typeShipping}
              onChange={(e) => setTypeShipping(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="FOB">FOB</option>
              <option value="CIF">CIF</option>
            </select>

            <input
              type="text"
              placeholder="Transportadora"
              value={carrying}
              onChange={(e) => setCarrying(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <textarea
              placeholder="Observações"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows="4"
            />

          </div>

        </div>

        {/* 🔹 COLUNA DIREITA */}
        <div className="card h-fit space-y-4">

          <h2 className="font-semibold">
            Resumo
          </h2>

          {cartItems.map((item, index) => (
            <div key={index} className="border-b pb-2">
              <p className="font-medium">
                {item.code} - {item.name}
              </p>
              <p className="text-sm">
                Qtd: {item.quantity}
              </p>
              <p className="text-sm font-medium">
                Total: {formatCurrency(item.finalTotalPrice)}
              </p>
            </div>
          ))}

          <div className="flex justify-between font-semibold text-lg pt-4">
            <span>Total Final:</span>
            <span> {formatCurrency(totalWithDiscount)}</span>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={loading || !selectedClient}
            className="btn-primary bg-primary w-full mt-4 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Criando..." : "Confirmar e Criar Pedido"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default CreateOrder;