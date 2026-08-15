import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiUrl from "../utils/api";
import formatCurrency from "../utils/money";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await apiUrl.get(`/api/orders/${id}`);
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Pedido não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
        setError("Erro ao carregar os detalhes do pedido.");
      }
    };
    fetchOrder();
  }, [id]);

  const handleRemove = async () => {
    try {
      await apiUrl.delete(`/api/orders/${id}`);
      navigate("/orders");
    } catch (error) {
      setError("Falha ao remover o pedido.");
      console.log("Error deleting order:", error);
      setShowConfirmDelete(false);
    }
  };
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!order) {
    return <div className="container-page text-center">Carregando...</div>;
  }

  const { client, items } = order;

  return (
    <div className="container-page space-y-8 p-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Pedido: <span className="text-primary">{order.numberPedido}</span>
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Data de Emissão</p>
          <p className="font-semibold">
            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* DADOS DO CLIENTE */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 text-primary">
            Dados do Cliente
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="font-bold">Razão Social:</span> {client.rSocial}
            </p>
            <p>
              <span className="font-bold">Nome Fantasia:</span> {client.nFantasia}
            </p>
            <p>
              <span className="font-bold">CNPJ:</span> {client.cnpj}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-bold">Insc. Estadual:</span>{" "}
                {client.inscEstadual || "Isento"}
              </p>
              <p>
                <span className="font-bold">Suframa:</span>{" "}
                {client.suframa || "-"}
              </p>
            </div>
            <p>
              <span className="font-bold">Endereço:</span> {client.address},{" "}
              {client.bairro}
            </p>
            <p>
              <span className="font-bold">Cidade/UF:</span> {client.city} -{" "}
              {client.county}
            </p>
            <p>
              <span className="font-bold">CEP:</span> {client.cep}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-bold">Telefone:</span> {client.phone || client.cellPhone}
              </p>
              <p>
                <span className="font-bold">Email:</span> {client.email}
              </p>
            </div>
          </div>
        </div>

        {/* DADOS COMERCIAIS */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 text-primary">
            Informações do Pedido
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-bold">Prazo de Pagamento:</span> {order.term}
            </p>
            <p>
              <span className="font-bold">Tipo de Frete:</span>{" "}
              {order.typeShipping}
            </p>
            <p>
              <span className="font-bold">Transportadora:</span>{" "}
              {order.carrying || "A definir"}
            </p>
            <p>
              <span className="font-bold">Status:</span>{" "}
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">
                {order.status}
              </span>
            </p>
            {order.observations && (
              <div className="mt-4 p-3 bg-gray-50 rounded border italic">
                <span className="font-bold block not-italic mb-1">Observações:</span>
                {order.observations}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ITENS DO PEDIDO */}
      <div className="card">
        <h2 className="text-xl font-bold border-b pb-4 text-primary mb-4">
          Itens do Pedido
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-3 border-b">Produto</th>
                <th className="p-3 border-b">Estrutura / Revestimento</th>
                <th className="p-3 border-b text-center">Tela</th>
                <th className="p-3 border-b text-center">Qtd</th>
                <th className="p-3 border-b text-right">Preço Un.</th>
                <th className="p-3 border-b text-center">Desc. %</th>
                <th className="p-3 border-b text-right">Total c/ Desc.</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3">
                    <p className="font-bold">{item.cod} - {item.name}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-xs"><span className="font-semibold">Est:</span> {item.structureName}</p>
                    <p className="text-xs"><span className="font-semibold">Rev:</span> {item.materialName}</p>
                  </td>
                  <td className="p-3 text-center text-xs">{item.colorTelas || "-"}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(item.priceList)}</p>
                    <p>{formatCurrency(item.priceWithDiscount)}</p>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center text-[10px] leading-tight text-gray-600">
                      {item.discount1 > 0 && <span>{item.discount1}%</span>}
                      {item.discount2 > 0 && <span>+ {item.discount2}%</span>}
                      {item.discount3 > 0 && <span>+ {item.discount3}%</span>}
                      {item.discount4 > 0 && <span>+ {item.discount4}%</span>}
                      {item.discount1 === 0 && item.discount2 === 0 && item.discount3 === 0 && item.discount4 === 0 && "-"}
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold">
                    <p className="text-xs text-gray-400 font-normal line-through">{formatCurrency(item.priceTotalWithoutDisc)}</p>
                    <p>{formatCurrency(item.priceTotalWithDisc)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-lg">
                <td colSpan="5" className="p-4 text-right font-bold text-gray-600">
                  Total Final:
                </td>
                <td className="p-4 text-right font-black text-primary">
                  {formatCurrency(order.totalWithDiscounts)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={async () => {
            try {
              const response = await apiUrl.get(`/api/orders/${id}/pdf`, {
                responseType: 'blob'
              });
              const file = new Blob([response.data], { type: 'application/pdf' });
              const fileURL = URL.createObjectURL(file);
              window.open(fileURL);
            } catch (error) {
              console.error("Erro ao gerar PDF:", error);
              alert("Falha ao gerar o PDF.");
            }
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
        >
          Visualizar PDF
        </button>

        {showConfirmDelete ? (
          <div className="flex gap-2 items-center bg-red-50 p-2 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium">Confirmar exclusão?</p>
            <button
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm font-bold"
            >
              Sim
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="bg-gray-200 text-gray-700 px-4 py-1 rounded hover:bg-gray-300 text-sm font-bold"
            >
              Não
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="border-2 border-red-500 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
          >
            Remover Pedido
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
