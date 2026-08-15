
import React, { useState, useEffect, useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';
import boxIcon from '../../assets/order_icon.svg'; // Placeholder icon
import formatCurrency from '../../utils/money';
import api from '../../utils/api';

const ListOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { navigate } = useContext(GlobalContext)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get(`/api/orders/list`);
                if (response.data.success) {
                    setOrders(response.data.orders);
                } else {
                    setError('Failed to fetch orders.');
                }
            } catch (err) {
                setError('An error occurred while fetching orders.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, []);

    const handleDelete = async (orderId) => {
        if (window.confirm('Tem certeza que deseja deletar este pedido?')) {
            try {
                const response = await api.delete(`/api/orders/${orderId}`);
                if (response.data.success) {
                    setOrders(orders.filter(order => order._id !== orderId));
                } else {
                    alert('Failed to delete order.');
                }
            } catch (err) {
                alert('An error occurred while deleting the order.');
                console.error(err);
            }
        }
    };

    if (loading) {
        return <div className="md:p-10 p-4">Loading...</div>;
    }

    if (error) {
        return <div className="md:p-10 p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders List</h2>
            {orders.length > 0 ? (
                orders.map((order) => (
                    <div key={order._id} className="flex flex-col md:grid md:grid-cols-[1fr_2fr_1fr_1fr] md:items-center gap-5 p-5 max-w-5xl rounded-md border border-gray-300 text-gray-800">
                        <div className="flex items-center gap-5">
                            <img className="w-12 h-12 object-cover opacity-60" src={boxIcon} alt="boxIcon" />
                            <div>
                                <p className="font-bold text-indigo-600">#{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm ml-2">
                            <p className='font-medium mb-1'>{order.client?.nFantasia || 'Client not available'}</p>
                            <p>{order.client?.city || ''}</p>
                        </div>
                        <p className="font-medium text-base ml-3 my-auto text-black/70">
                            R$ {formatCurrency(order.totalAmount)}
                        </p>
                        <div className="flex gap-2 justify-self-end">
                            <button onClick={() => navigate(`/admin/order/${order._id}`)} className="px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:text-white-700 cursor-pointer">
                                Detalhes
                            </button>
                            <button onClick={() => handleDelete(order._id)} className="px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:text-white-700 cursor-pointer">
                                Deletar
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default ListOrder;