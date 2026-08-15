import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import formatCurrency from '../../utils/money';
// import { calculateItemDiscount } from '../../utils/discount';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../components/OrderPDFViewer';
import api from '../../utils/api';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showPdf, setShowPdf] = useState(false); // Estado para controlar a visualização do PDF

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await api.get(`/api/orders/${id}`);
                if (response.data.success) {
                    setOrder(response.data.order);
                } else {
                    setError(response.data.message || 'Pedido não encontrado.');
                }
            } catch (err) {
                setError('Falha ao buscar os detalhes do pedido.');
                console.error('Error fetching order details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [ api, id]);

    const handleRemove = async () => {
        try {
            await api.delete(`/api/orders/${id}`);
            navigate('/admin/list-orders');
        } catch (err) {
            setError('Falha ao remover o pedido.');
            console.error('Error deleting order:', err);
            setShowConfirmDelete(false);
        }
    };

    if (loading) {
        return <div className="max-w-6xl mx-auto px-4 py-8 text-center">Carregando...</div>;
    }

    if (error) {
        return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
    }

    if (!order) {
        return <div className="max-w-6xl mx-auto px-4 py-8 text-center">Pedido não encontrado.</div>;
    }

    // Se showPdf for true, renderiza o PDF Viewer em tela cheia
    if (showPdf) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px', backgroundColor: '#333' }}>
                    <button
                        onClick={() => setShowPdf(false)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
                <PDFViewer width="100%" height="95%">
                    <OrderPDF order={order} />
                </PDFViewer>
            </div>
        );
    }

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium">Detalhes do Pedido</h1>
                    <div className="flex gap-4">
                        
                        <Link to="/admin/list-orders" className="text-indigo-600 hover:text-indigo-900 flex items-center">&larr; Voltar</Link>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                    {/* Seção de Resumo do Pedido */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Pedido #{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">Data: {new Date(order.createdAt).toLocaleDateString()}</p>
                            {order.createdBy && <p className="text-sm text-gray-500">Vendedor: {order.createdBy.name}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">Total: {formatCurrency(order.totalAmount)}</p>
                            <p className="text-sm text-gray-500">Prazo: {order.prazo}</p>
                            <p className="text-sm text-gray-500">Transportadora: {order.transportadora}</p>
                        </div>
                    </div>

                    {/* Seção do Cliente */}
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Cliente</h3>
                        <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-medium text-gray-800">{order.client?.rSocial}</p>
                                <p className="text-sm text-gray-500">{order.client?.nFantasia}</p>
                                <p className="text-sm text-gray-600">CNPJ: {order.client?.cnpj}</p>
                                <p className="text-sm text-gray-600">{order.client?.address}, {order.client?.bairro}</p>
                                <p className="text-sm text-gray-600">CEP: {order.client?.cep} - {order.client?.city} / {order.client?.county}</p>
                            </div>
                            <div className='ml-15 '>
                                <p className="text-sm mt-4 text-gray-600">Inscrição Estadual: {order.client?.inscEstadual}</p>
                                {order.client?.suframa && <p className="text-sm text-gray-600">Suframa: {order.client?.suframa}</p>}
                                           
                                <p className="text-sm mt-3 text-gray-600">Telefone: {order.client?.phone}</p>
                                <p className="text-sm text-gray-600">Email: {order.client?.email}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Seção de Itens do Pedido */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Itens do Pedido</h3>
                        <div className="space-y-3">
                            {order.products.map((item, itemIndex) => {
                               // const finalPrice = calculateItemDiscount(item.price, item.discount1, item.discount2, item.discount3, item.discount4);
                               // const discounts = [item.discount1, item.discount2, item.discount3, item.discount4].filter(d => d > 0).join('% + ');

                                return (
                                    <div key={itemIndex} className="flex items-start justify-between bg-gray-50 p-3 rounded">
                                        <div className="flex flex-1">
                                            <div className=''>
                                                <p className="font-medium">{item.productId?.name}</p>
                                                <p className="text-sm text-gray-500">Código: {item.productId?.codp}</p>
                                                {item.description && <p className="text-sm text-gray-500">Descrição: {item.description.join(' - ')}</p>}
                                                <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                                            </div>
                                            <div className='ml-20 mt-4'>
                                                {item.base && <p className="text-sm text-gray-500">Base: {item.base}</p>}
                                                {item.tela && <p className="text-sm text-gray-500">Tela: {item.tela}</p>}
                                                {item.revestimento && <p className="text-sm text-gray-500">Revestimento: {item.revestimento}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-medium text-primary">
                                                {formatCurrency(item.totalPriceAfterDiscount)}
                                            </p>
                                            {item.discounts && (
                                                <div className="text-sm text-gray-500">
                                                    <span>Descontos: </span>
                                                    {Object.entries(item.discounts).map(([key, value]) => (
                                                        <span key={key}>{`${value}% `}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 line-through">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Seção de Observação */}
                    {order.observation && (
                        <div>
                            <h3 className="text-sm font-medium mb-2">Observação</h3>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm text-gray-600">{order.observation}</p>
                            </div>
                        </div>
                    )}

                    {/* Seção de Ações do Admin */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                        <button
                            onClick={() => setShowPdf(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                            Visualizar PDF
                        </button>
                        <PDFDownloadLink
                            document={<OrderPDF order={order} />}
                            fileName={`pedido-${order.orderNumber}.pdf`}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                        >
                            {({ loading }) => (loading ? 'Gerando...' : 'Baixar PDF')}
                        </PDFDownloadLink>
                        {showConfirmDelete ? (
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-gray-600">Tem certeza?</p>
                                <button
                                    onClick={handleRemove}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                >
                                    Sim, remover
                                </button>
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowConfirmDelete(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-500 rounded hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                                Remover Pedido
                            </button>
                        )}
                    </div>

                    
                </div>
            </div>

        </div>
    );
};

export default OrderDetail;