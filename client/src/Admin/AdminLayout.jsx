import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

const AdminLayout = () => {

  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItem = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
        location.pathname === to
          ? "bg-primary text-white"
          : "hover:bg-primary/10"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-backgroundSoft flex flex-col">

      {/* HEADER */}
      <header className="bg-primary text-white">

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1"
            >
              <span className="w-6 h-[2px] bg-white"></span>
              <span className="w-6 h-[2px] bg-white"></span>
              <span className="w-6 h-[2px] bg-white"></span>
            </button>

            <h1 className="font-semibold text-lg">
              Admin Panel
            </h1>

            <span className="hidden md:block text-sm opacity-80">
              Sucesso Representações
            </span>

          </div>

          <Link
            to="/"
            className="text-sm bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20"
          >
            ← Voltar ao App
          </Link>
        </div>
      </header>


      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside
          className={`bg-white shadow-md w-64 p-4 space-y-2
          ${menuOpen ? "block" : "hidden"} md:block`}
        >

          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            Administração
          </h2>

          {navItem("/admin", "Produtos")}
          {navItem("/admin/list-products", "Lista Produtos")}
          {navItem("/admin/clients", "Clientes")}
          {navItem("/admin/list-clients", "Lista Clientes")}
          {navItem("/admin/register", "Usuários")}

        </aside>


        {/* CONTEÚDO */}
        <main className="flex-1 p-6">

          <div className="max-w-6xl mx-auto">

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
};

export default AdminLayout;