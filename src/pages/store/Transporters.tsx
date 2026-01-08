import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUsuarioLogado } from '@/auth';
import { 
  Truck, Plus, Search, MoreHorizontal, Save, 
  Loader2, Edit, Trash2, Building2, User 
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

export function Transporters() {
  const { toast } = useToast();
  const usuario = getUsuarioLogado();
  
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PJ');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nome_razao: '',
    cpf_cnpj: '',
    municipio: '',
    uf: '',
    endereco: '',
    inscricao_estadual: ''
  });


const formatDocument = (value: string) => {
  const cleanValue = value.replace(/\D/g, ''); // Remove tudo que não é número

  // Limita o tamanho máximo (14 para CNPJ)
  const truncated = cleanValue.slice(0, 14);

  if (truncated.length <= 11) {
    // Máscara de CPF: 000.000.000-00
    return truncated
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  } else {
    // Máscara de CNPJ: 00.000.000/0000-00
    return truncated
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }
};

  useEffect(() => { fetchCarriers(); }, []);

  function resetForm() {
    setFormData({
      nome_razao: '',
      cpf_cnpj: '',
      municipio: '',
      uf: '',
      endereco: '',
      inscricao_estadual: ''
    });
    setEditingId(null);
    setTipoPessoa('PJ');
  }

  async function fetchCarriers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transportadora') 
        .select(`
          idtransportadora, tipo, municipio, uf, endereco,
          transportadora_pf(nome, cpf),
          transportadora_pj(razaosocial, cnpj, inscricaoestadual)
        `);
      
      if (error) {
        console.error('Erro ao buscar transportadoras:', error);
        throw error;
      }

      console.log('Dados brutos da API:', data);

      const normalizedData = data?.map(t => {
        console.log('Processando transportadora:', t);
        return {
          id: t.idtransportadora,
          tipo: t.tipo,
          documento: t.tipo === 'PF' ? t.transportadora_pf?.[0]?.cpf : t.transportadora_pj?.[0]?.cnpj,
          nome_razao: t.tipo === 'PF' ? t.transportadora_pf?.[0]?.nome : t.transportadora_pj?.[0]?.razaosocial,
          municipio: t.municipio,
          uf: t.uf,
          endereco: t.endereco,
          original: t
        };
      });

      console.log('Dados normalizados:', normalizedData);
      setCarriers(normalizedData || []);
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({ title: "Erro", description: "Falha ao carregar transportadoras: " + error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = carriers.filter(c => {
    const nome = c.nome_razao || "";
    const doc = c.documento || "";
    const matchesSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) || doc.includes(searchTerm.replace(/\D/g, ''));
    const matchesFilter = filterTipo === 'TODOS' || c.tipo === filterTipo;
    return matchesSearch && matchesFilter;
  });

  function startEdit(carrier: any) {
    setEditingId(carrier.id);
    setTipoPessoa(carrier.tipo);
    setFormData({
      nome_razao: carrier.nome_razao || '',
      cpf_cnpj: formatDocument(carrier.documento || ''),
      municipio: carrier.municipio || '',
      uf: carrier.uf || '',
      endereco: carrier.endereco || '',
      inscricao_estadual: carrier.original.transportadora_pj?.inscricaoestadual || ''
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    const emitenteId = usuario?.idemitente || usuario?.id_emitente;
    setLoading(true);

    try {
      // Parâmetros base comuns a ambos (Cadastro e Edição)
      const params: any = {
        p_tipo: tipoPessoa,
        p_cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        p_nome_razao: formData.nome_razao,
        p_endereco: formData.endereco || null,
        p_municipio: formData.municipio || null,
        p_uf: formData.uf || null,
        p_inscricao_estadual: tipoPessoa === 'PJ' ? (formData.inscricao_estadual || null) : null
      };

      if (editingId) {
        // --- LÓGICA DE ATUALIZAÇÃO ---
        params.p_idtransportadora = editingId; // O ID que vem do startEdit
        
        const { error } = await supabase.rpc('editar_transportadora_completa', params);
        if (error) throw error;
        
        toast({ title: "Sucesso!", description: "Transportadora atualizada com sucesso." });
      } else {
        // --- LÓGICA DE NOVO CADASTRO ---
        if (!emitenteId) throw new Error("ID do emitente não identificado.");
        
        params.p_idemitente = emitenteId;
        const { error } = await supabase.rpc('cadastrar_transportadora_completa', params);
        if (error) throw error;
        
        toast({ title: "Sucesso!", description: "Transportadora cadastrada com sucesso." });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCarriers();
    } catch (error: any) {
      console.error("Erro na operação:", error);
      toast({ 
        title: "Erro ao salvar", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta transportadora?")) return;
    try {
      const { error } = await supabase.rpc('deletar_transportadora_completa', { p_idtransportadora: id });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Transportadora removida." });
      fetchCarriers();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transportadoras</h1>
          <p className="text-sm text-slate-500">Gestão de parceiros logísticos</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#7c3aed] text-white">
          <Plus size={18} className="mr-2" /> Nova Transportadora
        </Button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm p-6 flex justify-between items-center">
            <div><p className="text-xs font-medium text-slate-500 uppercase">Total</p><h3 className="text-2xl font-bold">{carriers.length}</h3></div>
            <Truck className="text-violet-600" size={24} />
        </Card>
        <Card className="bg-white border-none shadow-sm p-6 flex justify-between items-center">
            <div><p className="text-xs font-medium text-slate-500 uppercase">Empresas (PJ)</p><h3 className="text-2xl font-bold text-blue-600">{carriers.filter(c => c.tipo === 'PJ').length}</h3></div>
            <Building2 className="text-blue-600" size={24} />
        </Card>
        <Card className="bg-white border-none shadow-sm p-6 flex justify-between items-center">
            <div><p className="text-xs font-medium text-slate-500 uppercase">Pessoas (PF)</p><h3 className="text-2xl font-bold text-orange-600">{carriers.filter(c => c.tipo === 'PF').length}</h3></div>
            <User className="text-orange-600" size={24} />
        </Card>
      </div>

      {/* TABELA COM DOCUMENTO EXIBIDO */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <Tabs defaultValue="TODOS" onValueChange={setFilterTipo}>
            <TabsList><TabsTrigger value="TODOS">Todos</TabsTrigger><TabsTrigger value="PJ">PJ</TabsTrigger><TabsTrigger value="PF">PF</TabsTrigger></TabsList>
          </Tabs>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar por nome ou documento..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[60px]">Tipo</TableHead>
                <TableHead>Razão Social / Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && carriers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
              ) : filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      c.tipo === 'PJ' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>{c.tipo}</span>
                  </TableCell>
                  <TableCell className="font-medium">{c.nome_razao}</TableCell>
                  <TableCell className="text-slate-600 font-mono text-sm">{formatDocument(c.documento || '')}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{c.municipio} - {c.uf}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => startEdit(c)} className="cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(c.id)} className="cursor-pointer text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG COM INPUT MASCARADO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[550px]">
          <DialogHeader><DialogTitle>{editingId ? 'Editar Transportadora' : 'Nova Transportadora'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(v: any) => { setTipoPessoa(v); setFormData({...formData, cpf_cnpj: ''}) }} value={tipoPessoa}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white"><SelectItem value="PJ">PJ</SelectItem><SelectItem value="PF">PF</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                <Input 
                  placeholder={tipoPessoa === 'PJ' ? "00.000.000/0000-00" : "000.000.000-00"}
                  value={formData.cpf_cnpj} 
                  onChange={e => setFormData({...formData, cpf_cnpj: formatDocument(e.target.value)})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{tipoPessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'}</Label>
              <Input value={formData.nome_razao} onChange={e => setFormData({...formData, nome_razao: e.target.value})} />
            </div>
            {tipoPessoa === 'PJ' && (
                <div className="space-y-2"><Label>Inscrição Estadual</Label><Input value={formData.inscricao_estadual} onChange={e => setFormData({...formData, inscricao_estadual: e.target.value})} /></div>
            )}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2"><Label>Município</Label><Input value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} /></div>
              <div className="col-span-1 space-y-2"><Label>UF</Label><Input maxLength={2} value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} /></div>
            </div>
            <div className="space-y-2"><Label>Endereço Completo</Label><Input value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading} className="w-full bg-[#7c3aed] text-white">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} 
              {editingId ? 'Salvar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}