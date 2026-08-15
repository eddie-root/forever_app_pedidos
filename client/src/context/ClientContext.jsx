import React, { createContext, useState, useContext, useEffect } from 'react'
import apiUrl from "../utils/api"


const ClientContext = createContext();

export const ClientProvider = ({ children }) => {

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState(()=> {
    const stored = localStorage.getItem("selectedClient");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(()=> {
    if (selectedClient) {
      localStorage.setItem("selectedClient", JSON.stringify(selectedClient))
    } else {
      localStorage.removeItem("selectedClient")
    }
  }, [selectedClient])

  // LISTAR (GET /api/client)
  const fetchClients = async ()=> {
    setLoading(true);
    try {
      const { data } = await apiUrl.get("/api/client");
      if (data.success) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes: ", error);
    } finally {
      setLoading(false);
    }
  }

  // CRIAR (POST /api/client)
  const createClient = async (clientData)=> {
    try {
      const { data } = await apiUrl.post("/api/client", clientData);
      if (data.success) {
        setClients(prev => [...prev, data.client]);
        return { success: true, client: data.client };
      }
      return { success: false, message: data.message || "Erro ao criar cliente"}
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao criar cliente" 
      };
    }
  };

  // ATUALIZAR (PUT /api/client/:id)
  const updateClient = async (id, clientData)=> {
    try {
      const { data } = await apiUrl.put(`/api/client/${id}`, clientData);
      if (data.success) {
        setClients(prev=> prev.map(c => c.id === id ? data.client : c ));
        return { success: true };
      }
      return { success: false, message: data.message || "Erro ao atualizar cliente" };
    } catch (error) {
      return { success: false, message: "Erro ao atualizar cliente", error };
    }
  };

  // DELETAR (DELETE /api/client/:id)
  const deleteClient = async (id)=> {
    try {
      const { data } = await apiUrl.delete(`/api/client/${id}`);
      if (data.success) {
        setClients(prev => prev.filter(c => c.id !== id ));
        if(selectedClient?.id === id) setSelectedClient(null);
        return { success: true };
      }
      return { success: false, message: data.message || "Erro ao deletar cliente"}
    } catch (error) {
      return { success: false, message: "Erro ao deletar cliente", error};
    }
  }


  const value = {
      clients, 
      loading, 
      fetchClients, 
      createClient, 
      updateClient, 
      deleteClient, 
      selectedClient, 
      setSelectedClient 
  }

  return (
    <ClientContext.Provider value={value}>
      {children}  
    </ClientContext.Provider>
  )
}

export const useClient = ()=> useContext(ClientContext)
