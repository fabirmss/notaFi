import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Building2, Plus, Search, MoreHorizontal, Edit, 
  Trash2, MapPin, Save, Loader2, Building, Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function RegisterEmitter() {
  const { toast } = useToast();
  const [emitters, setEmitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialFormState = {
    cnpj: '', nome_fantasia: '', razao_social: '', inscricao_estadual: '',
    logradouro: '', numero: '', bairro: '', municipio: '', uf: '', cep: '', telefone: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- MÁSCARAS ---
  const formatCNPJ = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").substring(0, 18);
  const formatCEP = (v: string) => v.replace(/\D/g, '').replace(/^(\d{5})(\d{3})/, "$1-$2").substring(0, 9);

  useEffect(() => { fetchEmitters(); }, []);

  async function fetchEmitters() {
    setLoading(true);
    const { data, error } = await supabase.from('emitente').select('*').order('nome_fantasia');
    
    if (!error) {
      const normalized = data?.map(item => ({
        ...item,
        id_display: item.idemitente,
        razao_social: item.razao_social || item.razaosocial || '',
        nome_fantasia: item.nome_fantasia || item.nomefantasia || '',
        inscricao_estadual: item.inscricao_estadual || item.inscricaoestadual || '',
      }));
      setEmitters(normalized || []);
    }
    setLoading(false);
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id_display); 
    setFormData({
      cnpj: formatCNPJ(item.cnpj || ''),
      nome_fantasia: item.nome_fantasia,
      razao_social: item.razao_social,
      inscricao_estadual: item.inscricao_estadual,
      logradouro: item.logradouro || '',
      numero: item.numero || '',
      bairro: item.bairro || '',
      municipio: item.municipio || '',
      uf: item.uf || '',
      cep: formatCEP(item.cep || ''),
      telefone: item.telefone || '',
    });
    setIsDialogOpen(true);
  };

  async function handleDelete(id: number) {
    if (!confirm("Deseja excluir este emitente?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('emitente').delete().eq('idemitente', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Emitente excluído." });
      fetchEmitters();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: "Verifique vínculos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const cleanData = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        uf: formData.uf.toUpperCase(),
        idusuario: 1 
      };

      if (editingId) {
        const { error } = await supabase.from('emitente').update(cleanData).eq('idemitente', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('emitente').insert([cleanData]);
        if (error) throw error;
      }

      toast({ title: "Sucesso!", description: "Dados gravados." });
      setIsDialogOpen(false);
      setEditingId(null);
      fetchEmitters(); 
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = emitters.filter(e => 
    e.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.cnpj?.includes(searchTerm.replace(/\D/g, ''))
  );

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Emitentes Fiscais</h1>
          <p className="text-muted-foreground text-sm">Controle de unidades de emissão NFe.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData(initialFormState); setIsDialogOpen(true); }} className="bg-violet-600 hover:bg-violet-700">
          <Plus size={18} className="mr-2" /> Novo Emitente
        </Button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Unidades</p>
              <h3 className="text-2xl font-bold text-slate-800">{emitters.length}</h3>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600"><Building size={24} /></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Estados (UF)</p>
              <h3 className="text-2xl font-bold text-slate-800">{new Set(emitters.map(e => e.uf)).size}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Globe size={24} /></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Cidades Atendidas</p>
              <h3 className="text-2xl font-bold text-slate-800">{new Set(emitters.map(e => e.municipio)).size}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><MapPin size={24} /></div>
          </CardContent>
        </Card>
      </div>
        
      {/* TABELA */}
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between px-6 py-4">
          <CardTitle className="text-lg font-bold text-slate-700">Unidades Cadastradas</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="CNPJ ou Nome..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-6 py-4">Emitente / IE</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Endereço Completo</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id_display} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><Building2 size={20} /></div>
                      <div>
                        <p className="font-bold text-slate-700">{item.nome_fantasia}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">IE: {item.inscricao_estadual || 'NÃO INFORMADO'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-mono font-medium text-slate-600">{formatCNPJ(item.cnpj || '')}</p>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 uppercase mt-1">{item.uf}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-600">
                      <p className="font-medium">{item.logradouro}, {item.numero}</p>
                      <p className="text-slate-400">{item.bairro} - {item.municipio}/{item.uf}</p>
                      <p className="text-[10px] text-violet-500 font-mono mt-0.5">{formatCEP(item.cep || '')}</p>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                        <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer gap-2 py-2"><Edit size={14} className="text-blue-500" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id_display)} className="cursor-pointer gap-2 py-2 text-red-600"><Trash2 size={14} /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG DE CADASTRO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Emitente' : 'Novo Emitente'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Nome Fantasia</Label><Input value={formData.nome_fantasia} onChange={e => setFormData({...formData, nome_fantasia: e.target.value})} /></div>
              <div className="space-y-1"><Label>Razão Social</Label><Input value={formData.razao_social} onChange={e => setFormData({...formData, razao_social: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label>CNPJ</Label><Input value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: formatCNPJ(e.target.value)})} /></div>
              <div className="space-y-1"><Label>IE</Label><Input value={formData.inscricao_estadual} onChange={e => setFormData({...formData, inscricao_estadual: e.target.value})} /></div>
              <div className="space-y-1"><Label>CEP</Label><Input value={formData.cep} onChange={e => setFormData({...formData, cep: formatCEP(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 space-y-1"><Label>Logradouro</Label><Input value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: e.target.value})} /></div>
              <div className="space-y-1"><Label>Nº</Label><Input value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} /></div>
              <div className="space-y-1"><Label>Bairro</Label><Input value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Cidade</Label><Input value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} /></div>
              <div className="space-y-1"><Label>UF</Label><Input maxLength={2} value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading} className="w-full bg-violet-600 text-white">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Salvar Unidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}