import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate()
    const { login, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(()=> {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        
        if (result.success) {
            navigate("/");
        } else {
            alert(result.message || "Email ou senha inválidos");
        }
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>
            <form 
                onSubmit={onSubmitHandler} 
                className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
            >
                            

                <p className="text-2xl font-medium m-auto">
                    <span className="text-primary">Usuário</span> Login
                </p>

                <div className="w-full">
                    <p>Email</p>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        placeholder="Digite seu email" 
                        className="border border-gray-400 rounded w-full p-2 mt-1 outline-primary" 
                        type="email" 
                        required 
                    />
                </div>
                <div className="w-full">
                    <p>Senha</p>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        placeholder="Digite sua senha" 
                        className="border border-gray-400 rounded w-full p-2 mt-1 outline-primary" 
                        type="password" 
                        required 
                    />
                </div>

                <button
                    type="submit"
                    className="bg-primary hover:bg-opacity-90 transition-all text-white w-full py-2 mt-10 rounded-md cursor-pointer"
                >
                    Fazer login
                </button>
 
            </form>
        </div>
    );
}

export default Login;
