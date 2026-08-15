import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const navItem = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        location.pathname === to
          ? "bg-white shadow-sm text-primary"
          : "hover:bg-white/60"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-backgroundSoft">
      {/* NAVBAR */}
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg cursor-pointer" onClick={() => navigate('/')}>
              Forever Representações
            </h1>
            <span className="hidden md:block text-sm opacity-80 uppercase tracking-widest">
              Forever
            </span>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl">
            {navItem("/", "Home")}
            {navItem("/products", "Produtos")}
            {navItem("/cart", "Carrinho")}
            {navItem("/orders", "Pedidos")}
            {navItem("/clients", "Clientes")}

            <div className="border-l border-white/20 mx-2 h-6"></div>

            {/* LOGIN / LOGOUT / USER / ADMIN */}
            {!user ? (
              navItem("/login", "Login")
            ) : (
              <div className="flex items-center gap-1">
                {/* NOME DO USUÁRIO NO MOMENTO */}
                <span className="px-3 text-xs font-bold bg-white/20 h-8 flex items-center rounded-lg">
                  {user.name}
                </span>

                {/* BOTÃO ADMIN - SÓ PARA QUEM TEM RULE ADMIN */}
                {isAdmin && navItem("/admin", "Admin")}

                {/* BOTÃO SAIR NO LUGAR DO LOGIN */}
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </nav>

          {/* HAMBURGER (Mobile) */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1 p-2">
            <span className="w-6 h-[2px] bg-white"></span>
            <span className="w-6 h-[2px] bg-white"></span>
            <span className="w-6 h-[2px] bg-white"></span>
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-primary text-white border-t border-white/10">
          <div className="flex flex-col p-4 gap-2">
            {navItem("/", "Home")}
            {navItem("/products", "Produtos")}
            {navItem("/cart", "Carrinho")}
            {user?.role === "ADMIN" && navItem("/admin", "Admin")}

            {!user ? (
              navItem("/login", "Login")
            ) : (
              <>
                <div className="px-4 py-2 text-xs opacity-60">Logado como: {user.name}</div>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left px-4 py-2 bg-red-500/20 rounded-lg">
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
