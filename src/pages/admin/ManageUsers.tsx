import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  UserPlus, Loader2, Save, Shield, 
  MoreHorizontal, Edit, Trash2, Mail, User 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function ManageUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [emitters, setEmitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado do formulário sincronizado com as colunas do banco
  const [formData, setFormData] = useState({
    nome: '',
    usuario: '', 
    email: '',
    senha: '',
    nivel_acesso: 'LOJISTA',
    idemitente: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Busca na tabela 'usuario' (singular) e faz o JOIN com 'emitente'
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select(`
          id,
          nome,
          usuario,
          email,
          nivel_acesso,
          idemitente,
          emitente (nome_fantasia)
        `)
        .order('id');

      // Busca os emitentes para o Select de vínculo
      const { data: emitterData, error: emitError } = await supabase
        .from('emitente')
        .select('idemitente, nome_fantasia')
        .order('nome_fantasia');
      
      if (userError) throw userError;
      if (emitError) throw emitError;

      setUsers(userData || []);
      setEmitters(emitterData || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Prepara o formulário para edição
  function startEdit(user: any) {
    setEditingId(user.id);
    setFormData({
      nome: user.nome || '',
      usuario: user.usuario || '',
      email: user.email || '',
      senha: '', // Senha em branco por segurança na edição
      nivel_acesso: user.nivel_acesso || 'LOJISTA',
      idemitente: user.idemitente?.toString() || ''
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.usuario || !formData.email || (editingId === null && !formData.senha)) {
      toast({ title: "Erro", description: "Campos obrigatórios ausentes.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nome: formData.nome,
        usuario: formData.usuario,
        email: formData.email,
        nivel_acesso: formData.nivel_acesso,
        idemitente: formData.nivel_acesso === 'ADMIN' ? null : parseInt(formData.idemitente)
      };

      // Só atualiza a senha se o campo for preenchido
      if (formData.senha) {
        payload.senha = formData.senha;
      }

      const { error } = editingId 
        ? await supabase.from('usuario').update(payload).eq('id', editingId)
        : await supabase.from('usuario').insert([payload]);

      if (error) throw error;

      toast({ 
        title: "Sucesso!", 
        description: editingId ? "Perfil atualizado." : "Acesso criado com sucesso." 
      });
      
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover este acesso permanentemente?")) return;
    try {
      const { error } = await supabase.from('usuario').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Removido", description: "Acesso excluído com sucesso." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  }

  function resetForm() {
    setFormData({ nome: '', usuario: '', email: '', senha: '', nivel_acesso: 'LOJISTA', idemitente: '' });
    setEditingId(null);
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Contas de Acesso</h1>
          <p className="text-sm text-slate-500">Gerencie permissões e vínculos com emitentes</p>
        </div>
        
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-100">
          <UserPlus size={18} /> Novo Acesso
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(val) => { setIsDialogOpen(val); if (!val) resetForm(); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>Preencha os dados de acesso para o sistema.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome real" />
              </div>
              <div className="space-y-2">
                <Label>Login / Usuário</Label>
                <Input value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} placeholder="ex: joao.silva" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@empresa.com" />
            </div>

            <div className="space-y-2">
              <Label>Senha {editingId && '(deixe vazio para manter a atual)'}</Label>
              <Input type="password" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select onValueChange={(v) => setFormData({...formData, nivel_acesso: v})} value={formData.nivel_acesso}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="LOJISTA">LOJISTA (Acesso Limitado)</SelectItem>
                  <SelectItem value="ADMIN">ADMIN (Acesso Total)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.nivel_acesso === 'LOJISTA' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <Label className="text-violet-600 font-bold">Vincular a Emitente</Label>
                <Select onValueChange={(v) => setFormData({...formData, idemitente: v})} value={formData.idemitente}>
                  <SelectTrigger className="bg-violet-50 border-violet-100"><SelectValue placeholder="Selecione a empresa..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {emitters.map(e => (
                      <SelectItem key={e.idemitente} value={e.idemitente.toString()}>{e.nome_fantasia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading} className="w-full bg-violet-600 py-6 text-white font-bold">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
              {editingId ? 'Salvar Alterações' : 'Criar Conta de Acesso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-6">Identificação</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Emitente Vinculado</TableHead>
                <TableHead className="text-right px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-400"><User size={20} /></div>
                      <div>
                        <p className="font-bold text-slate-800">{u.nome}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={12} /> {u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                      u.nivel_acesso === 'ADMIN' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {u.nivel_acesso}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium">
                    {u.emitente?.nome_fantasia ? (
                      <span className="flex items-center gap-1"><Shield size={14} className="text-slate-300" /> {u.emitente.nome_fantasia}</span>
                    ) : (
                      <span className="text-slate-300 italic">Global</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border shadow-xl rounded-lg" align="end">
                        <DropdownMenuItem onClick={() => startEdit(u)} className="cursor-pointer py-2 hover:bg-slate-50"><Edit className="w-4 h-4 mr-2" /> Editar </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(u.id)} className="text-red-600 cursor-pointer py-2 hover:bg-red-50 font-bold border-t border-slate-50"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-slate-400 italic">Carregando usuários do sistema...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}