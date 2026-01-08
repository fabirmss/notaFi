import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getUsuarioLogado } from '../../auth';
import { 
  Plus, Search, MoreHorizontal, Save, 
  Loader2, Edit, Trash2, Users, Building2, User 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// MÁSCARA BLINDADA
const formatarDoc = (valor: string | null | undefined) => {
  if (!valor) return "---";
  const limpo = valor.toString().replace(/\D/g, ""); 
  if (limpo.length === 11) return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (limpo.length === 14) return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (limpo.length > 11 && limpo.length < 14) {
    return limpo.padStart(14, '0').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return limpo; 
};

export function Clients() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PJ');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nome_razao: '',
    cpf_cnpj: '',
    inscricao_estadual: '',
    email: '',
    telefone: '',
    endereco: '',
    municipio: '',
    uf: '',
    nome_fantasia: ''
  });

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cliente')
        .select(`
          idcliente, tipo, municipio, uf, email, telefone, endereco,
          cliente_pf(nome, cpf),
          cliente_pj(razaosocial, nomefantasia, cnpj, inscricaoestadual)
        `);
      
      if (error) throw error;

      const normalizedData = data?.map(c => ({
        id: c.idcliente,
        tipo: c.tipo,
        nome_razao: c.tipo === 'PF' ? c.cliente_pf?.nome : c.cliente_pj?.razaosocial,
        documento: c.tipo === 'PF' ? c.cliente_pf?.cpf : c.cliente_pj?.cnpj,
        municipio: c.municipio,
        uf: c.uf,
        email: c.email,
        telefone: c.telefone,
        original: c
      }));

      setCustomers(normalizedData || []);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  const filtered = customers.filter(c => {
    const matchesSearch = c.nome_razao?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.documento?.includes(searchTerm.replace(/\D/g, ''));
    const matchesFilter = filterTipo === 'TODOS' || c.tipo === filterTipo;
    return matchesSearch && matchesFilter;
  });

  function startEdit(customer: any) {
    setEditingId(customer.id);
    setTipoPessoa(customer.tipo);
    setFormData({
      nome_razao: customer.nome_razao || '',
      cpf_cnpj: customer.documento || '',
      email: customer.email || '',
      telefone: customer.telefone || '',
      endereco: customer.original.endereco || '',
      municipio: customer.municipio || '',
      uf: customer.uf || '',
      inscricao_estadual: customer.original.cliente_pj?.inscricaoestadual || '',
      nome_fantasia: customer.original.cliente_pj?.nomefantasia || ''
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({ nome_razao: '', cpf_cnpj: '', inscricao_estadual: '', email: '', telefone: '', endereco: '', municipio: '', uf: '', nome_fantasia: '' });
    setEditingId(null);
  }

  async function handleSave() {
    const documentoLimpo = formData.cpf_cnpj.replace(/\D/g, '');
    
    if (tipoPessoa === 'PF' && documentoLimpo.length !== 11) {
      toast({ 
        title: "CPF Inválido", 
        description: "O CPF deve ter exatamente 11 dígitos.", 
        variant: "destructive" 
      });
      return;
    }

    if (tipoPessoa === 'PJ' && documentoLimpo.length !== 14) {
      toast({ 
        title: "CNPJ Inválido", 
        description: "O CNPJ deve ter exatamente 14 dígitos.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        p_tipo: tipoPessoa,
        p_documento: documentoLimpo,
        p_nome_razao: formData.nome_razao,
        p_email: formData.email || null,
        p_telefone: formData.telefone || null,
        p_endereco: formData.endereco || null,
        p_municipio: formData.municipio || null,
        p_uf: formData.uf || null,
        p_inscricao_estadual: formData.inscricao_estadual || null,
        p_nome_fantasia: formData.nome_fantasia || null
      };

      if (editingId) params.p_idcliente = editingId;

      const { error } = await supabase.rpc(editingId ? 'editar_cliente_completo' : 'cadastrar_cliente_completo', params);
      if (error) throw error;

      toast({ title: "Sucesso!", description: "Dados salvos com sucesso." });
      setIsDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">Gestão de destinatários</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#7c3aed]">
          <Plus size={18} className="mr-2" /> Novo Cliente
        </Button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total</p>
              <h3 className="text-2xl font-bold mt-1">{customers.length}</h3>
            </div>
            <Users className="text-violet-600" size={24} />
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Empresas (PJ)</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{customers.filter(c => c.tipo === 'PJ').length}</h3>
            </div>
            <Building2 className="text-blue-600" size={24} />
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Pessoas (PF)</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">{customers.filter(c => c.tipo === 'PF').length}</h3>
            </div>
            <User className="text-orange-600" size={24} />
          </CardContent>
        </Card>
      </div>

      {/* TABELA */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <Tabs defaultValue="TODOS" onValueChange={setFilterTipo}>
            <TabsList>
              <TabsTrigger value="TODOS">Todos</TabsTrigger>
              <TabsTrigger value="PJ">PJ</TabsTrigger>
              <TabsTrigger value="PF">PF</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[60px]">Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      c.tipo === 'PJ' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {c.tipo}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{c.nome_razao}</TableCell>
                  <TableCell className="font-mono text-sm">{formatarDoc(c.documento)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{c.municipio} - {c.uf}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => startEdit(c)} className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="bg-white sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>{editingId ? 'Editar Cadastro' : 'Novo Cliente'}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select onValueChange={(v: any) => setTipoPessoa(v)} value={tipoPessoa}>
              <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="PF">PF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
            <Input 
              value={formData.cpf_cnpj} 
              maxLength={tipoPessoa === 'PJ' ? 14 : 11}
              onChange={e => setFormData({...formData, cpf_cnpj: e.target.value.replace(/\D/g, '')})} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{tipoPessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'}</Label>
          <Input 
            value={formData.nome_razao} 
            onChange={e => setFormData({...formData, nome_razao: e.target.value})} 
          />
        </div>

        {/* CAMPOS EXCLUSIVOS PARA PJ */}
        {tipoPessoa === 'PJ' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input 
                value={formData.nome_fantasia} 
                onChange={e => setFormData({...formData, nome_fantasia: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Inscrição Estadual</Label>
              <Input 
                value={formData.inscricao_estadual} 
                onChange={e => setFormData({...formData, inscricao_estadual: e.target.value})} 
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 space-y-2">
            <Label>Município</Label>
            <Input 
              value={formData.municipio} 
              onChange={e => setFormData({...formData, municipio: e.target.value})} 
            />
          </div>
          <div className="col-span-1 space-y-2">
            <Label>UF</Label>
            <Input 
              maxLength={2} 
              value={formData.uf} 
              onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Endereço Completo</Label>
          <Input 
            value={formData.endereco} 
            onChange={e => setFormData({...formData, endereco: e.target.value})} 
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave} disabled={loading} className="w-full bg-[#7c3aed] text-white">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} 
          {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
        </Button>
      </DialogFooter>
    </DialogContent>
    </Dialog>
    </div>
  );
}