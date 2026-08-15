import { useEffect, useState } from 'react'
import apiUrl from '../utils/api'

const AdminUser = () => {

  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Campos de formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  })

  const fetchUsers = async ()=> {
    try {
      // prefixo correto : /api/user
      const res = await apiUrl.get("/api/user");
      setUsers(res.data);
    } catch (err) {
      console.log("Erro ao carregar usuários", err);
    }
  };

  useEffect(()=> {
    fetchUsers();
  }, []);

  const handleSubmit = async (e)=> {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar usuário (PUT /api/user/:id)
        await apiUrl.put(`/api/user/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Criar usuário (POST /api/user/register)
        await apiUrl.post("/api/user/register", formData);
      }

      setFormData({ name: "", email: "", password: "", role: "USER" });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar usuário");
    }
  };

  const handleEdit = (user)=> {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    });
  };

  const deleteUser = async (id)=> {
    if (window.confirm("Deseja realmente deletar este usuário?")) {
      try {
        await apiUrl.delete(`/api/user/${id}`);
        fetchUsers()
      } catch (err) {
        alert("Erro ao deletar usuário", err)
      }
    }
  };
  
  return (
    <div className='p-10'>
      <h1 className='text-2xl front-bold mb-6'>Gerenciar Usuários</h1>
      
      {/* FORMULÁTIO  */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-96 bg-gray-100 p-6 rounded shadow-sm'>
        <h2 className='text-lg font-semibold'>{editingId ? "Editar Usuário" : "Novo Usuário"}</h2>

        <input 
          type="text"
          placeholder='Nome'
          value={formData.name}
          onChange={(e)=> setFormData({ ...formData, name: e.target.value })}
          className='border p-2 rounded'
          required
        />
        <input 
          type="email"
          placeholder='Email'
          value={formData.email}
          onChange={(e)=> setFormData({ ...formData, email: e.target.value })}
          className='border p-2 rounded'
          required
        />
        <input 
          type="password"
          placeholder={editingId ? "Nova senha (opcional)" : "Senha"}
          value={formData.password}
          onChange={(e)=> setFormData({ ...formData, password: e.target.value })}
          className='border p-2 rounded'
          required={!editingId}
        />
        
        <div className='flex items-center gap-4 py-2'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input 
              type="radio"
              name='role'
              checked={formData.role === "USER"}
              onChange={()=> setFormData({ ...formData, role: "USER" })}
            />
            USER
          </label>
          <label className='flex items-center gap-2 cursor-pointer text-blue-600 font-blod'>
            <input 
              type="radio"
              name='role'
              checked={formData.role === "ADMIN"}
              onChange={()=> setFormData({ ...formData, role: 'ADMIN' })}
            />
            ADMIN
          </label>
        </div>

        <div className='flex gap-2 mt-2'>
          <button className='bg-blue-600 text-white flex-1 p-2 rounded hover:bg-blue-700'>
            {editingId ? "Salvar Alterações" : "Criar Usuário"}
          </button>
          {editingId && (
            <button 
              type='button'
              onClick={()=> { setEditingId(null); setFormData({ name: "", email: "", password: "", role: "USER" }); }}
              className='bg-gray-400 text-white px-4 p-2 rounded'
            >
              Cancelar
            </button>
          )}
        </div>

      </form>

      {/*  LISTA  */}
      <div className='mt-10'>
        <h2 className='text-xl mb-4 font-semibold'>Lista de Usuários</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {users.map((u)=> (
            <div key={u.id} className='border p-4 rounded-lg flex flex-col justify-between shadow-sm bg-white'>
              <div>
                <p className='font-bold text-lg'>{u.name}</p>
                <p className='text-gray-600'>{u.email}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded inline-block mt-2 ${u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-primary-100 text-primary-700'}`}>
                  {u.role}
                </span>
              </div>

              <div className='flex gap-2 mt-4 pt-4 border-t'>
                <button
                  onClick={()=> handleEdit(u)}
                  className='bg-yellow-500 text-white px-3 py-1 rounded flex-1 text-sm hover:bg-yellow-600'
                >
                  Editar
                </button>
                <button 
                  onClick={()=> deleteUser(u.id)}
                  className='bg-red-500 text-white px-3 py-1 rounded flex-1 text-sm hover:bg-red-600'
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminUser
