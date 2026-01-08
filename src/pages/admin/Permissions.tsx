import { useState } from 'react';
import { ShieldCheck, Plus, Search, Mail, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const admins = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@nfemanager.com.br',
    role: 'Super Admin',
    lastAccess: 'Hoje, 14:32',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@nfemanager.com.br',
    role: 'Admin',
    lastAccess: 'Ontem, 09:15',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@nfemanager.com.br',
    role: 'Admin',
    lastAccess: '19/12/2024, 16:45',
  },
];

export function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permissões</h1>
          <p className="text-muted-foreground">Gerencie os usuários administradores do sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card">
            <DialogHeader>
              <DialogTitle>Novo Administrador</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário com acesso administrativo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-name">Nome Completo</Label>
                <Input id="admin-name" placeholder="Nome do administrador" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-email">E-mail</Label>
                <Input id="admin-email" type="email" placeholder="email@empresa.com.br" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-role">Nível de Acesso</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Admins
            </CardTitle>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Super Admins
            </CardTitle>
            <ShieldCheck className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.filter((a) => a.role === 'Super Admin').length}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            <ShieldCheck className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.filter((a) => a.role === 'Admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários Administradores</CardTitle>
              <CardDescription>Lista de todos os administradores do sistema</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {admin.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'Super Admin'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {admin.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{admin.lastAccess}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
