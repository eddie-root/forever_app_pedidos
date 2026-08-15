import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import formatCurrency from "../utils/money";
import { toast } from "react-hot-toast"
import apiUrl from "../utils/api";

const ListOrders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchOrders = async () => {
      try {
        const { data } = await apiUrl.get("/api/orders/list");

        if (data.success) {
          setOrders(data.orders);
        }

      } catch (error) {
        toast.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

  }, []);

  if (loading) {
    return <div className="container-page">Carregando pedidos...</div>;
  }

  return (
    <div className="container-page space-y-6">

      <h1 className="text-2xl font-semibold">
        Lista de Pedidos
      </h1>

      {orders.length === 0 && (
        <div className="card">Nenhum pedido encontrado.</div>
      )}

      <div className="card divide-y">

        {orders.map(order => (

          <div
            key={order.id}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex justify-between items-center py-4 cursor-pointer hover:bg-gray-50 px-2 rounded-md transition"
          >

            <div>
              <p className="font-semibold">
                Pedido Nº {order.numberPedido}
              </p>

              <p className="text-sm text-gray-600">
                {order.client?.rSocial}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {formatCurrency(order.totalWithDiscounts)}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default ListOrders;