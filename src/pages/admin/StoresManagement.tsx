import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUsuarioLogado } from '@/auth';
import { 
  Store, Plus, Search, MoreHorizontal, MapPin, 
  Save, Loader2, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function StoresManagement() {
  const { toast } = useToast();
  const usuario = getUsuarioLogado();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  // Estado do formulário sincronizado com o banco
  const [formData, setFormData] = useState({
    nome_loja: '',
    cnpj_unidade: '',
    municipio: '',
    uf: '',
    id_emitente: usuario?.id_emitente || null
  });

  // Cálculos para os cards baseados nos dados reais
  const totalLojas = stores.length;
  const lojasAtivas = stores.filter(s => s.ativo !== false).length; // Considera ativo por padrão
  const cidadesDiferentes = new Set(stores.map(s => s.municipio).filter(Boolean)).size;

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    // Busca todas as lojas para popular a tabela
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .order('nome_loja');
      
    if (error) console.error("Erro Supabase:", error.message);
    if (!error) setStores(data || []);
  }

  async function handleCreateStore() {
    setLoading(true);
    try {
      // Garante que o ID do emitente logado seja enviado
      const payload = { ...formData, id_emitente: usuario?.id_emitente };
      const { error } = await supabase.from('lojas').insert([payload]);
      
      if (error) throw error;

      toast({ title: "Sucesso!", description: "Loja cadastrada no banco de dados." });
      setIsDialogOpen(false);
      fetchStores();
      setFormData({ ...formData, nome_loja: '', cnpj_unidade: '', municipio: '', uf: '' });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filteredStores = stores.filter(
    (store) =>
      store.nome_loja?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.cnpj_unidade?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gerenciamento de Lojas</h1>
          <p className="text-muted-foreground text-sm">Unidades vinculadas ao seu emitente</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#7c3aed] hover:bg-[#6d28d9] gap-2 shadow-md">
          <Plus size={18} /> Criar Nova Loja
        </Button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total de Lojas</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900">{totalLojas}</h3>
            </div>
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
              <Store size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Lojas Ativas</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">{lojasAtivas}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Municípios</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{cidadesDiferentes}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <MapPin size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE LOJAS */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lojas Cadastradas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
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
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.nome_loja}</TableCell>
                  <TableCell className="font-mono text-sm">{store.cnpj_unidade}</TableCell>
                  <TableCell>{store.municipio} - {store.uf}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {store.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Bloquear</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL DE CADASTRO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Nova Loja</DialogTitle>
            <DialogDescription>Cadastre uma unidade vinculada ao seu emitente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Loja</Label>
              <Input value={formData.nome_loja} onChange={e => setFormData({...formData, nome_loja: e.target.value})} placeholder="Ex: Filial Norte" />
            </div>
            <div className="grid gap-2">
              <Label>CNPJ da Unidade</Label>
              <Input value={formData.cnpj_unidade} onChange={e => setFormData({...formData, cnpj_unidade: e.target.value})} placeholder="00.000.000/0000-00" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>UF</Label>
                <Input maxLength={2} value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateStore} disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Loja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}