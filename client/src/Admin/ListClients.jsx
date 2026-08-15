import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiUrl from '../utils/api';

const ListClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await apiUrl.get('/api/client');
      if (data.success) {
        setClients(data.clients);
      } 
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const { data } = await apiUrl.delete(`/api/client/${id}`);
        if (data.success) {
          toast.success('Cliente excluído com sucesso');
          fetchClients();
        } else {
          toast.error(data.message || "Erro ao excluir cliente");
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Erro na requisição de exclusão');
      }
    }
  };

  // Lógica de Paginação
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return clients.slice(indexOfFirstItem, indexOfLastItem);
  }, [clients, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className='no-scrollbar flex-1 h-[85vh] overflow-y-scroll'>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-medium">Lista de Clientes ({clients.length})</h1>
          <button
            onClick={() => navigate("/admin/clients")}
            className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 cursor-pointer"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.rSocial}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cnpj}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/edit-client/${client.id}`)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {currentItems.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow p-4 border">
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
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-4">
                <button
                  onClick={() => navigate(`/admin/edit-client/${client.id}`)}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-md border ${
                    currentPage === i + 1 ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListClients;
