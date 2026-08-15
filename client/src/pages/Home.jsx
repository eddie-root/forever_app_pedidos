import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiUrl from "../utils/api";
import formatCurrency from "../utils/money";

const Home = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiUrl.get("/api/orders/list");
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };
  
    fetchOrders();
  }, []);

  const openOrders = [];
  const confirmedOrders = [];
  const cancelledOrders = [];

  const lastOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="title-page">Dashboard</h1>
        <Link to="/products" className="btn-primary">
          + Novo Pedido
        </Link>
      </div>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="card">
          <p className="text-textSecondary text-sm">Pré-Pedidos</p>
          <h2 className="text-3xl font-semibold mt-2">
            {openOrders.length}
          </h2>
        </div>

        <div className="card">
          <p className="text-textSecondary text-sm">Confirmados</p>
          <h2 className="text-3xl font-semibold mt-2">
            {confirmedOrders.length}
          </h2>
        </div>

        <div className="card">
          <p className="text-textSecondary text-sm">Cancelados</p>
          <h2 className="text-3xl font-semibold mt-2">
            {cancelledOrders.length}
          </h2>
        </div>

      </div>

      {/* ÚLTIMOS PEDIDOS */}
      <div className="card">
        <h2 className="title-section">Últimos Pedidos</h2>

        {lastOrders.length === 0 ? (
          <p className="text-textSecondary text-sm">
            Nenhum pedido encontrado.
          </p>
        ) : (
          <div className="divide-y">
            {lastOrders.map(order => (
              <div
                key={order.id}
                className="flex justify-between items-center py-4"
              >
                <div>
                  <p className="font-medium">
                    Pedido #{order.numberPedido}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.client?.rSocial}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(order.totalWithDiscounts || 0)}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;