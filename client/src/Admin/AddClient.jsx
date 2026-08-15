import React, { useContext, useState } from 'react';
import AppContext from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const SellerAddClient = () => {
    const { navigate } = useContext(AppContext);
    const [formData, setFormData] = useState({
        rSocial: '',
        nFantasia: '',
        cnpj: '',
        inscEstadual: '',
        suframa: '',
        dataDeFundaçao: '',
        address: '',
        bairro: '',
        city: '',
        county: '',
        cep: '',
        contact: '',
        cellPhone: '',
        phone: '',
        email: '',
        emailNfe: '',
        contactFinan: '',
        phoneFinan: '',
        emailFinan: ''
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Aplicar formatação específica para cada campo
        if (name === 'cnpj') {
            formattedValue = formatCNPJ(value);
        } else if (name === 'cellPhone' || name === 'phone' || name === 'phoneFinan') {
            formattedValue = formatPhone(value);
        } else if (name === 'cep') {
            formattedValue = formatCEP(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Se o campo alterado for o CEP e tiver 8 dígitos, busca o endereço
        if (name === 'cep' && formattedValue.length === 8) {
            fetchAddress(formattedValue);
        }
    };

    const fetchAddress = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: data.logradouro,
                    bairro: data.bairro,
                    city: data.localidade,
                    county: data.uf
                }));
            } else {
                toast.error('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            toast.error('Erro ao buscar CEP');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format CNPJ (remove any non-numeric characters)
            const formattedData = {
                ...formData,
                cnpj: formData.cnpj.replace(/\D/g, ''),
                inscEstadual: formData.inscEstadual.replace(/\D/g, ''),
                suframa: formData.suframa ? formData.suframa.replace(/\D/g, '') : '',
                cellPhone: formData.cellPhone.replace(/\D/g, ''),
                phone: formData.phone ? formData.phone.replace(/\D/g, '') : '',
                phoneFinan: formData.phoneFinan ? formData.phoneFinan.replace(/\D/g, '') : '',
                cep: formData.cep.replace(/\D/g, '')
            };

            const { data } = await api.post('/api/client/create', formattedData);

            if (data.success) {
                toast.success('Cliente adicionado com sucesso!');
                navigate('/admin/add-client');
            } else {
                toast.error(data.message || 'Erro ao adicionar cliente');
            }
        } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Erro ao adicionar cliente');
            }
        }
    };

    // Função para formatar o CEP enquanto digita
    const formatCEP = (value) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        // Limita a 8 dígitos
        return numbers.slice(0, 8);
    };

    // Função para formatar o CNPJ enquanto digita
    const formatCNPJ = (value) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        // Limita a 14 dígitos
        const limitedNumbers = numbers.slice(0, 14);
        // Formata o CNPJ
        return limitedNumbers.replace(
            /^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/,
            function(match, p1, p2, p3, p4, p5) {
                if (p5) return `${p1}.${p2}.${p3}/${p4}-${p5}`;
                if (p4) return `${p1}.${p2}.${p3}/${p4}`;
                if (p3) return `${p1}.${p2}.${p3}`;
                if (p2) return `${p1}.${p2}`;
                return p1;
            }
        );
    };

    // Função para formatar o telefone enquanto digita
    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        const limitedNumbers = numbers.slice(0, 11);
        return limitedNumbers.replace(
            /^(\d{2})?(\d{5})?(\d{4})?/,
            function(match, p1, p2, p3) {
                if (p3) return `(${p1}) ${p2}-${p3}`;
                if (p2) return `(${p1}) ${p2}`;
                if (p1) return `(${p1})`;
                return '';
            }
        );
    };

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium">Adicionar Novo Cliente</h1>
                    <button 
                        onClick={() => navigate('/client-list')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Voltar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados Principais */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Dados Principais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Razão Social *
                                </label>
                                <input
                                    type="text"
                                    name="rSocial"
                                    value={formData.rSocial}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome Fantasia *
                                </label>
                                <input
                                    type="text"
                                    name="nFantasia"
                                    value={formData.nFantasia}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CNPJ *
                                </label>
                                <input
                                    type="text"
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Inscrição Estadual *
                                </label>
                                <input
                                    type="text"
                                    name="inscEstadual"
                                    value={formData.inscEstadual}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Suframa
                                </label>
                                <input
                                    type="text"
                                    name="suframa"
                                    value={formData.suframa}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Fundação
                                </label>
                                <input
                                    type="date"
                                    name="dataDeFundaçao"
                                    value={formData.dataDeFundaçao}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Endereço</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CEP *
                                </label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    placeholder="Digite o CEP"
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Endereço *
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bairro *
                                </label>
                                <input
                                    type="text"
                                    name="bairro"
                                    value={formData.bairro}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cidade *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado *
                                </label>
                                <input
                                    type="text"
                                    name="county"
                                    value={formData.county}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contato */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Contato</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contato *
                                </label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Celular *
                                </label>
                                <input
                                    type="tel"
                                    name="cellPhone"
                                    value={formData.cellPhone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contato Financeiro */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Contato Financeiro</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contato Financeiro
                                </label>
                                <input
                                    type="text"
                                    name="contactFinan"
                                    value={formData.contactFinan}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone Financeiro
                                </label>
                                <input
                                    type="tel"
                                    name="phoneFinan"
                                    value={formData.phoneFinan}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Financeiro
                                </label>
                                <input
                                    type="email"
                                    name="emailFinan"
                                    value={formData.emailFinan}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email NFe
                                </label>
                                <input
                                    type="email"
                                    name="emailNfe"
                                    value={formData.emailNfe}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/add-client/')}
                            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                            Salvar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellerAddClient; 