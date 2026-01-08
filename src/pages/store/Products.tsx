import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2, Package, Box, DollarSign, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getUsuarioLogado } from '../../auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Products() {
  const { toast } = useToast();
  const usuarioLogado = getUsuarioLogado();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnidade, setFilterUnidade] = useState('TODOS');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    codigointerno: '',
    ncm: '',
    descricao: '',
    valorunitario: '', 
    unidademedida: 'UN',
    estoque: '0'
  });

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase.from('produto').select('*').order('descricao', { ascending: true });
      
      // Proteção: só filtra se o id realmente existir
      if (usuarioLogado?.idemitente) {
        query = query.eq('idemitente', usuarioLogado.idemitente);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error);
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); }, []);

  // Cálculos dos Cards com proteção para valores nulos
  const totalItens = products?.length || 0;
  const estoqueTotal = products?.reduce((acc, p) => acc + Number(p.estoque || 0), 0) || 0;
  const valorFinanceiro = products?.reduce((acc, p) => acc + (Number(p.estoque || 0) * Number(p.valorunitario || 0)), 0) || 0;

  async function handleSaveProduct() {
    if (!formData.descricao || !formData.valorunitario) {
      toast({ title: "Atenção", description: "Descrição e Valor são obrigatórios!", variant: "destructive" });
      return;
    }

    try {
      const valorNumerico = parseFloat(formData.valorunitario.toString().replace(',', '.'));
      const estoqueNumerico = parseFloat(formData.estoque.toString().replace(',', '.'));

      const payload = {
       
        idemitente: usuarioLogado?.idemitente || 1, 
        descricao: formData.descricao,
        ncm: formData.ncm,
        valorunitario: valorNumerico,
        codigointerno: formData.codigointerno,
        unidademedida: formData.unidademedida,
        estoque: estoqueNumerico
      };

      const { error } = editingProduct 
        ? await supabase.from('produto').update(payload).eq('idproduto', editingProduct.idproduto)
        : await supabase.from('produto').insert([payload]);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Dados salvos com sucesso." });
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  }

  function resetForm() {
    setFormData({ codigointerno: '', ncm: '', descricao: '', valorunitario: '', unidademedida: 'UN', estoque: '0' });
    setEditingProduct(null);
  }

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setFormData({
      codigointerno: product.codigointerno || '',
      ncm: product.ncm || '',
      descricao: product.descricao || '',
      valorunitario: product.valorunitario?.toString().replace('.', ',') || '',
      unidademedida: product.unidademedida || 'UN',
      estoque: product.estoque?.toString().replace('.', ',') || '0'
    });
    setIsDialogOpen(true);
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.codigointerno?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterUnidade === 'TODOS' || p.unidademedida === filterUnidade;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-muted-foreground text-sm">Gerencie seu catálogo</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#7c3aed] gap-2 text-white">
          <Plus size={18} /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Variedade de Itens</p>
              <h3 className="text-2xl font-bold mt-1">{totalItens} produtos</h3>
            </div>
            <Package className="text-violet-600" size={24} />
          </CardContent>
        </Card>
        
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Estoque Crítico (≤ 5)</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">
                {products?.filter(p => Number(p.estoque || 0) <= 5).length} itens
              </h3>
            </div>
            <Box className="text-orange-600" size={24} />
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Valor do Inventário</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                R$ {valorFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <DollarSign className="text-emerald-600" size={24} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CardTitle>Catálogo</CardTitle>
            <Tabs defaultValue="TODOS" onValueChange={setFilterUnidade}>
              <TabsList className="h-8">
                <TabsTrigger value="TODOS" className="text-xs">TUDO</TabsTrigger>
                <TabsTrigger value="UN" className="text-xs">UN</TabsTrigger>
                <TabsTrigger value="KG" className="text-xs">KG</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-violet-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[50px]">Unid.</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Código / NCM</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.idproduto}>
                    <TableCell>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 uppercase">
                        {p.unidademedida}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{p.descricao}</TableCell>
                    <TableCell>
                       <div className="text-xs font-mono">{p.codigointerno || '---'}</div>
                       <div className="text-[10px] text-slate-400">NCM: {p.ncm || '---'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${Number(p.estoque) <= 5 ? 'text-red-500' : 'text-slate-600'}`}>
                        {Number(p.estoque).toLocaleString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-violet-700">
                      R$ {Number(p.valorunitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} /></Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => handleEditClick(p)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" /> 
                             Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> 
                             Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar' : 'Novo'} Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cód. Interno</Label>
                <Input value={formData.codigointerno} onChange={e => setFormData({...formData, codigointerno: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>NCM</Label>
                <Input value={formData.ncm} onChange={e => setFormData({...formData, ncm: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Preço</Label>
                <Input value={formData.valorunitario} onChange={e => setFormData({...formData, valorunitario: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Estoque</Label>
                <Input value={formData.estoque} onChange={e => setFormData({...formData, estoque: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={formData.unidademedida} onValueChange={(v) => setFormData({...formData, unidademedida: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="UN">UN</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveProduct} className="w-full bg-[#7c3aed] text-white">
              <Save className="mr-2 w-4 h-4" /> 
                Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Products;