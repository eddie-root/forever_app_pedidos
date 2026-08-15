import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ListClient = () => {
  const { navigate } = useContext(GlobalContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/client/getAll');
      if (response.data.success) {
        setClients(response.data.clients);
      }
    } catch (error) {
      toast.error('Erro ao carregar clientes');
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const response = await api.delete(`/api/client/deleteClient/${id}`);
        if (response.data.success) {
          toast.success('Cliente excluído com sucesso');
          fetchClients();
        }
      } catch (error) {
        toast.error('Erro ao excluir cliente');
        console.error('Error deleting client:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Lista de Clientes</h1>
        <button
          onClick={() => navigate('/admin/add-client')}
          className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Adicionar Cliente
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razão Social
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Fantasia
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.rSocial}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.nFantasia}</div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/edit-client/${client._id}`)}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => (
          <div key={client._id} className="bg-white rounded-lg shadow p-4">
            <div className="space-y-2">
              <div>
                <h3 className="font-medium text-gray-900">{client.rSocial}</h3>
                <p className="text-sm text-gray-500">{client.nFantasia}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">CNPJ:</p>
                  <p className="text-gray-900">{client.cnpj}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cidade:</p>
                  <p className="text-gray-900">{client.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contato:</p>
                  <p className="text-gray-900">{client.contact}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4 mt-4">
              <button
                onClick={() => navigate(`/admin/edit-client/${client._id}`)}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(client._id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListClient;
