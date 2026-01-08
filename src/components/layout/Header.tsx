import { Building2, ShieldCheck, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


import { logout, getUsuarioLogado } from '../../auth';

export function Header() {
  const user = getUsuarioLogado();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      
      <div className="flex items-center gap-4">
        {isAdmin ? (
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary transition-colors">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold"> Administrativo </span>
          </div>
        ) : (
        
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 text-green-700 transition-colors">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-bold"> Lojista </span>
          </div>
        )}
      </div>

      
      <div className="flex items-center gap-3">
    
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
         
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.nome || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            
            
            <DropdownMenuItem 
              className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}