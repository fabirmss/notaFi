import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Package, Truck, FileText, Settings, User, LogOut 
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getUsuarioLogado, logout } from "@/auth";

export function Sidebar() {
  const location = useLocation();
  const usuario = getUsuarioLogado();


  const menuItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "LOJISTA"] },
    { title: "Produtos", path: "/produtos", icon: Package, roles: ["LOJISTA", "ADMIN"] },
    { title: "Clientes", path: "/clientes", icon: Users, roles: ["LOJISTA", "ADMIN"] },
    { title: "Transportadoras", path: "/transportadoras", icon: Truck, roles: ["LOJISTA", "ADMIN"] },
    { title: "Notas Fiscais", path: "/notas", icon: FileText, roles: ["LOJISTA", "ADMIN"] },
    
  
    { title: "Emitente", path: "/admin/cadastrar-emitente", icon: Settings, roles: ["ADMIN"] },
    { title: "Contas de Acesso", path: "/admin/usuario", icon: User, roles: ["ADMIN"] }, 
  ];

  const roleAtual = usuario?.role?.toUpperCase() || "";
  const filteredItems = menuItems.filter(item => item.roles.includes(roleAtual));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0 shadow-xl font-sans">
      <div className="p-6 border-b border-slate-800/50">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center">
             <FileText size={18} className="text-white" />
          </div>
          Nota Fiscal
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-violet-600 text-white shadow-md" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-500"} />
              <span>{item.title}</span>
            </Link>
          );
        })}
        
    
        {filteredItems.length === 0 && (
          <p className="text-[10px] text-red-400 px-4">Erro: Perfil "{roleAtual}" não reconhecido.</p>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        {usuario && (
          <div className="px-4 py-3 mb-4 bg-slate-800/50 rounded-lg">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Usuário Logado</p>
            <p className="text-xs text-slate-300 truncate font-medium">
              {usuario.nome || usuario.email}
            </p>   
            <p className="text-[9px] text-violet-400 font-bold mt-1">{roleAtual}</p>       
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-colors"
          onClick={logout}>
          <LogOut size={20} />
          <span>Sair</span>
        </Button>
      </div>      
    </aside>
  );
}