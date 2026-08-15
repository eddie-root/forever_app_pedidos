import { createContext, useEffect, useState, useContext } from "react";
import apiUrl from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children })=> {

    const [ user, setUser ] = useState(()=> {
        const saveUser = localStorage.getItem("user");
        return saveUser ? JSON.parse(saveUser) : null;
    });
    const [ isUser, setIsUser ] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("token") || null )

    useEffect(()=> {
        if (token) {
            apiUrl.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("token", token);
        } else {
            delete apiUrl.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token])

    useEffect(()=> {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user])
    
    const login = async ( email, password ) => {
        try {
          // CAMINHO COMPLETO: /api/user/login
          const res = await apiUrl.post("/api/user/login", { email, password });
          
          const { token: newToken, user: userData } = res.data;

          setToken(newToken);
          setUser(userData);

          return { success: true };

        } catch (error) {
            console.error("Erro no login: ", error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || "Email ou senha incorretos"
            };            
        }
    };

    const logout = ()=> {
        setToken(null);
        setUser(null);
        localStorage.clear();
    }

    const value = {
        user, 
        login, 
        logout,
        isUser,
        setIsUser,
        isAdmin: user?.role === "ADMIN"
    }

    return (
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    )
}


export const useAuth = ()=> useContext (AuthContext);
