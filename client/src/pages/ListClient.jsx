import { useEffect, useState } from "react";
import { useClient } from "../context/ClientContext";

const ClientList = () => {
  const { clients, fetchClients, setSelectedClient, loading } = useClient();
  const [search, setSearch] = useState("");

  // Busca os clientes ao carregar a página
  useEffect(() => {
    fetchClients();
  });

  const filteredClients = clients.filter(client =>
    client.rSocial?.toLowerCase().includes(search.toLowerCase()) ||
    client.cnpj?.includes(search)
  );

  return (
    <div className="container-page space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>

      <input
        type="text"
        placeholder="Buscar por Razão Social ou CNPJ"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-md px-4 py-2 outline-primary focus:ring-2 focus:ring-primary"
      />

      {loading ? (
        <p className="text-center text-gray-500">Carregando clientes...</p>
      ) : (
        <div className="space-y-4">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="card flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-lg">{client.rSocial}</p>
                  <p className="text-sm text-gray-500">CNPJ: {client.cnpj}</p>
                  <p className="text-sm text-gray-500">
                    Cidade: {client.city} - {client.county}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedClient(client);
                    alert(`Cliente selecionado: ${client.nFantasia}`);
                  }}
                  className="bg-primary hover:bg-opacity-90 text-white px-6 py-2 rounded-md font-medium transition-all"
                >
                  Selecionar
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">Nenhum cliente encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientList;
