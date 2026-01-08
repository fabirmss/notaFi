import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Componentes e Páginas
import { ManageUsers } from './pages/admin/ManageUsers';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Permissions } from "./pages/admin/Permissions";
import { RegisterEmitter } from "./pages/admin/RegisterEmitter";
import { Clients } from "./pages/store/Clients";
import { Products } from "./pages/store/Products";
import { Transporters } from "./pages/store/Transporters";
import { Invoices } from "./pages/store/Invoices";



// Autenticação
import { Login } from "./components/Login";
import { getUsuarioLogado, Usuario } from "./auth";

const queryClient = new QueryClient();

const App = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    const userLogado = getUsuarioLogado();
    setUsuario(userLogado);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {!usuario ? (
                /* FLUXO NÃO AUTENTICADO */
                <Route 
                  path="*" 
                  element={<Login onLoginSuccess={() => setUsuario(getUsuarioLogado())} />} 
                />
              ) : (
              
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />

                 
                  {usuario.role?.toUpperCase() === 'ADMIN' && (
                    <>
                      <Route path="/permissoes" element={<Permissions />} />
                      <Route path="/admin/cadastrar-emitente" element={<RegisterEmitter />} />
                      <Route path="/admin/usuario" element={<ManageUsers />} />
                      <Route path="/admin/usuarios" element={<ManageUsers />} /> 
                    </>
                  )}

    
                  <Route path="/clientes" element={<Clients />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/transportadoras" element={<Transporters />} />
                  <Route path="/notas" element={<Invoices />} />
                  <Route path="/notas/nova" element={<Invoices />} />

                  <Route path="/admin/*" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              )}
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  ); 
};

export default App;
