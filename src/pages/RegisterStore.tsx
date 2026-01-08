import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUsuarioLogado } from '@/auth';
import { Store, Plus, Save, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function RegisterStore() {
  const { toast } = useToast();
  const usuario = getUsuarioLogado();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome_loja: '',
    cnpj_unidade: '',
    municipio: '',
    uf: '',
    id_emitente: usuario?.id_emitente || null
  });

  useEffect(() => {
    if (usuario?.id_emitente) {
      fetchStores();
    }
  }, [usuario]);

  async function fetchStores() {
    // Filtra lojas apenas do emitente logado
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('id_emitente', usuario?.id_emitente)
      .order('nome_loja');
    
    if (!error) setStores(data || []);
  }

  async function handleSave() {
    if (!formData.nome_loja || !usuario?.id_emitente) {
      toast({ title: "Erro", description: "Nome da loja é obrigatório.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('lojas').insert([formData]);
      if (error) throw error;

      toast({ title: "Sucesso!", description: "Loja cadastrada." });
      setIsDialogOpen(false);
      fetchStores();
      setFormData({ ...formData, nome_loja: '', cnpj_unidade: '', municipio: '', uf: '' });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Exemplo de lógica de salvamento para a Loja
    async function salvarLoja(dadosLoja) {
    const usuario = getUsuarioLogado(); // Busca o admin logado
    
    const { data, error } = await supabase
        .from('lojas')
        .insert([{
        ...dadosLoja,
        id_emitente: usuario?.id_emitente // Vínculo obrigatório
        }]);
        
    if (error) console.error("Erro ao configurar loja:", error.message);
    }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store className="text-violet-600" /> Unidades / Lojas
        </h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus size={18} className="mr-2" /> Nova Loja
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Lojas Vinculadas ao seu Emitente</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Loja</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>CNPJ Unidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-bold">{store.nome_loja}</TableCell>
                  <TableCell className="flex items-center gap-1 text-slate-500">
                    <MapPin size={14} /> {store.municipio} - {store.uf}
                  </TableCell>
                  <TableCell>{store.cnpj_unidade || 'Mesmo da Matriz'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Cadastrar Nova Unidade</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Loja / Unidade</Label>
              <Input value={formData.nome_loja} onChange={e => setFormData({...formData, nome_loja: e.target.value})} placeholder="Ex: Filial Shopping" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>UF</Label>
                <Input maxLength={2} value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading} className="bg-violet-600 w-full">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Salvar Loja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}