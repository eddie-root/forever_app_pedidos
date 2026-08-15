import prisma from '../prisma/client.js';

// FUNÇÕES DE FORMATAÇÃO 
function formatCNPJ(cnpj) {
  if (!cnpj) return "";
  const pure = cnpj.replace(/\D/g, "");
  if (pure.length !== 14) return cnpj;
  return pure.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatCEP(cep) {
  if (!cep) return "";
  const pure = cep.replace(/\D/g, "");
  if (pure.length !== 8) return cep;
  return pure.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

function formatPhone(phone) {
  if (!phone) return "";
  const pure = phone.replace(/\D/g, "");
  if (pure.length === 11) {
    return pure.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (pure.length === 10) {
    return pure.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone;
}

// TRATAR DADOS DO CLIENTE
const prepareClientData = (data) => {
  // Apenas campos permitidos no esquema
  const allowedFields = [
    'rSocial', 'nFantasia', 'cnpj', 'inscEstadual', 'suframa', 
    'dateFoundation', 'address', 'bairro', 'city', 'county', 
    'cep', 'contact', 'cellPhone', 'phone', 'email', 'emailNfe', 
    'contactFinan', 'phoneFinan', 'emailFinan'
  ];

  const prepared = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      prepared[field] = data[field];
    }
  });

  // Mapeia dataDeFundaçao para dateFoundation se existir no input mas não no esquema
  if (data.dataDeFundaçao) {
    prepared.dateFoundation = data.dataDeFundaçao;
  }

  if (prepared.cnpj) prepared.cnpj = formatCNPJ(prepared.cnpj);
  if (prepared.cep) prepared.cep = formatCEP(prepared.cep);
  if (prepared.phone) prepared.phone = formatPhone(prepared.phone);
  if (prepared.cellPhone) prepared.cellPhone = formatPhone(prepared.cellPhone);
  if (prepared.phoneFinan) prepared.phoneFinan = formatPhone(prepared.phoneFinan);
  
  return prepared;
};

// CRIAR CLIENTE (POST)
export const createClient = async (req, res) => {
  try {
    const data = prepareClientData(req.body);
    const client = await prisma.clientPedido.create({
      data,
    });
    res.status(201).json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao criar cliente: " + error.message });
  }
}; 

// LISTAR TODOS OS CLIENTES ( GET )
export const getClients = async (req, res) => {
    try {
        const clients = await prisma.clientPedido.findMany({
            orderBy: { nFantasia: 'asc' }
        });
        res.json({
            success: true,
            clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao listar clientes: " + error.message
        });
    }
};

// BUSCAR CLIENTE POR ID ( GET )
export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.clientPedido.findUnique({
            where: { id: Number(id) },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Cliente não encontrado"
            });
        }

        res.json({
            success: true,
            client
        });
    } catch (error) {
        console.error("Error getting client:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar cliente: " + error.message
        });
    }
};

// ATUALIZAR CLIENTE ( PUT )
export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const data = prepareClientData(req.body);
        const updatedClient = await prisma.clientPedido.update({
            where: { id: Number(id) },
            data,
        });
        res.json({
            success: true,
            client: updatedClient
        });
    } catch (error) {
        console.error("Error deleting client:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar cliente: " + error.message 
        });
    }
};

// DELETAR CLIENTE 
export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.clientPedido.delete({
            where: { id: Number(id) },
        });
        res.json({
            success: true,
            message: "Cliente deletado com sucesso"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao deletar cliente"
        });
    }
};
