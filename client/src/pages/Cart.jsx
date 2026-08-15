import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useClient } from "../context/ClientContext";
import formatCurrency from "../utils/money";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    updateQuantity,
    updateDiscount,
    removeItem,
    clearCart,
    totalWithoutDiscount,
    totalWithDiscount,
  } = useCart();

  const {
    selectedClient
  } = useClient();

  if (cartItems.length === 0) {
    return (
      <div className="container-page">
        <h1 className="text-2xl font-semibold mb-6">Pedido</h1>
        <p>Nenhum item adicionado.</p>
      </div>
    );
  }

  const handleContinue = () => {

    if (!selectedClient) {
      alert("Selecione um cliente.");
      return;
    }

    navigate("/create-order");
  };

  return (
    <div className="container-page">

      <h1 className="text-2xl font-semibold mb-8">
        Pedido Atual
      </h1>

      {selectedClient && (
          <div className="card mb-6">
            <p className="font-semibold">
              Cliente selecionado:
            </p>

            <p>{selectedClient.rSocial}</p>
            <p className="text-sm text-textSecondary">
              CNPJ: {selectedClient.cnpj}
            </p>
            <p className="text-sm text-textSecondary">
              Cidade: {selectedClient.city}
            </p>
          </div>
        )}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* 🔹 LISTA DE ITENS */}
        <div className="lg:col-span-2 space-y-6">

          {cartItems.map((item, index) => (

            <div key={index} className="card">

              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-semibold">
                    {item.name} - {item.code}
                  </p>
                  <p className="text-sm text-textSecondary">
                    Estrutura: {item.structureName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    Revestimento: {item.materialName}
                  </p>
                  {item.tela && (
                    <p className="text-sm text-primary font-medium">
                      Tela: {item.tela}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 text-sm"
                >
                  Remover
                </button>
              </div>

              {/* 🔹 CARACTERÍSTICAS (DESCRIPTION) */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-1">Características:</p>
                <ul className="text-sm text-textSecondary">
                  {item.description?.split('\n').filter(l => l.trim() !== "").map((line, idx) => (
                    <li key={idx}>• {line.trim()}</li>
                  ))}
                </ul>
              </div>

              {/* QUANTIDADE */}
              <div className="flex items-center gap-4 mb-4">
                <span>Qtd:</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => 
                    updateQuantity(index, e.target.value)
                  }
                  className="border rounded px-2 py-1 w-20"
                />
              </div>

              {/* DESCONTOS (4 CAMPOS) */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="text-xs block">Desc 1 (%)</label>
                  <input
                    type="number"
                    value={item.discount1}
                    onChange={(e) => updateDiscount(index, "discount1", e.target.value)}
                    className="border rounded px-2 py-1 w-16"
                  />
                </div>
                <div>
                  <label className="text-xs block">Desc 2 (%)</label>
                  <input
                    type="number"
                    value={item.discount2}
                    onChange={(e) => updateDiscount(index, "discount2", e.target.value)}
                    className="border rounded px-2 py-1 w-16"
                  />
                </div>
                <div>
                  <label className="text-xs block">Desc 3 (%)</label>
                  <input
                    type="number"
                    value={item.discount3}
                    onChange={(e) => updateDiscount(index, "discount3", e.target.value)}
                    className="border rounded px-2 py-1 w-16"
                  />
                </div>
                <div>
                  <label className="text-xs block">Desc 4 (%)</label>
                  <input
                    type="number"
                    value={item.discount4}
                    onChange={(e) => updateDiscount(index, "discount4", e.target.value)}
                    className="border rounded px-2 py-1 w-16"
                  />
                </div>
              </div>

              {/* PREÇOS */}
              <div className="flex justify-between items-end border-t pt-4">
                <div>
                  <p className="text-sm text-textSecondary">
                    Preço base:
                  </p>
                  <p>
                    {formatCurrency(item.priceList)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-textSecondary">
                    Total do item:
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(item.finalTotalPrice)}
                  </p>
                </div>
              </div>

            </div>
          ))}

        </div>

        {/* 🔹 RESUMO */}
        <div className="card h-fit sticky top-6 space-y-4">
          <h2 className="text-lg font-semibold">Resumo</h2>
          <div className="flex justify-between">
            <span>Total sem desconto:</span>
            <span>{formatCurrency(totalWithoutDiscount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total com desconto:</span>
            <span>{formatCurrency(totalWithDiscount)}</span>
          </div>
          <button
            onClick={handleContinue}
            className="btn-primary bg-primary w-full mt-4 cursor-pointer"
          >
            Continuar Pedido
          </button>
          <button
            onClick={clearCart}
            className="btn-secondary bg-secondary w-full mt-3 cursor-pointer"
          >
            Cancelar Pedido
          </button>
        </div>

      </div>

    </div>
  );
};

export default Cart;