import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getUsuarioLogado } from '@/auth';
import { Plus, Trash2, Save, ArrowLeft, Loader2, Package, Truck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from "@/hooks/use-toast";

export function NewInvoice() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();

  // Alíquotas para cálculos de impostos
  const ALIQUOTA_ICMS = 0.18; 
  const ALIQUOTA_IPI = 0.05;  

  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [transportadoras, setTransportadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [invoice, setInvoice] = useState({
    numero_nota: '',
    id_cliente: '',
    id_transportadora: '',
    valor_frete: 0,
    itens: [] as any[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [resCli, resProd, resTrans] = await Promise.all([
          supabase.from('clientes').select('*'),
          supabase.from('produtos').select('*'),
          supabase.from('transportadoras').select('*')
        ]);
        if (resCli.data) setClientes(resCli.data);
        if (resProd.data) setProdutos(resProd.data);
        if (resTrans.data) setTransportadoras(resTrans.data);

        // Numeração automática da nota
        const { data: ultimaNota } = await supabase
          .from('notas_fiscais')
          .select('numero_nota')
          .eq('id_emitente', usuario?.id_emitente)
          .order('numero_nota', { ascending: false })
          .limit(1)
          .single();

        const proximoNumero = ultimaNota ? (parseInt(ultimaNota.numero_nota) + 1).toString() : "1";
        setInvoice(prev => ({ ...prev, numero_nota: proximoNumero }));
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    loadData();
  }, [usuario?.id_emitente]);

  const addItem = (idString: string) => {
    const prod = produtos.find(p => String(p.id) === idString);
    if (prod) {
      const preco = Number(prod.valor_unitario || 0);
      const novoItem = {
        id: prod.id,
        descricao: prod.descricao,
        quantidade: 1,
        valor_unitario: preco,
        subtotal: preco,
        valor_icms: preco * ALIQUOTA_ICMS,
        valor_ipi: preco * ALIQUOTA_IPI
      };
      setInvoice(prev => ({ ...prev, itens: [...prev.itens, novoItem] }));
    }
  };

  const updateItem = (index: number, campo: 'quantidade' | 'valor_unitario', valor: number) => {
    const novosItens = [...invoice.itens];
    novosItens[index][campo] = valor;
    novosItens[index].subtotal = novosItens[index].quantidade * novosItens[index].valor_unitario;
    
    // Atualiza impostos do item proporcionalmente
    novosItens[index].valor_icms = novosItens[index].subtotal * ALIQUOTA_ICMS;
    novosItens[index].valor_ipi = novosItens[index].subtotal * ALIQUOTA_IPI;
    
    setInvoice(prev => ({ ...prev, itens: novosItens }));
  };

  // Cálculos Automáticos de Totais
  const totalProdutos = invoice.itens.reduce((acc, item) => acc + item.subtotal, 0);
  const totalICMS = invoice.itens.reduce((acc, item) => acc + (item.valor_icms || 0), 0);
  const totalIPI = invoice.itens.reduce((acc, item) => acc + (item.valor_ipi || 0), 0);
  const totalNota = totalProdutos + Number(invoice.valor_frete) + totalIPI;

  const handleSave = async () => {
    if (!invoice.id_cliente || !invoice.numero_nota || invoice.itens.length === 0) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('notas_fiscais').insert([{
        numero_nota: invoice.numero_nota,
        id_emitente: usuario?.id_emitente,
        id_cliente: parseInt(invoice.id_cliente),
        id_transportadora: invoice.id_transportadora ? parseInt(invoice.id_transportadora) : null,
        valor_produtos: totalProdutos,
        valor_frete: invoice.valor_frete,
        valor_total: totalNota,
        itens: invoice.itens,
        data_emissao: new Date().toISOString()
      }]);
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Nota Fiscal emitida." });
      navigate('/notas');
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-black">
      <div className="flex justify-between items-center border-b pb-4 border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-violet-900 italic font-serif uppercase tracking-tight">Emissão de Nota Fiscal</h1>
          <p className="text-sm text-slate-500 font-medium">Preenchimento de dados fiscais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/notas')} className="text-black border-slate-200">Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Salvar Nota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm shadow-slate-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-violet-700 font-bold"><Users className="w-5 h-5" /> Cabeçalho</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Nº da Nota</label>
                <Input value={invoice.numero_nota} readOnly className="bg-slate-50 border-slate-200 text-black font-bold h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Cliente</label>
                <Select onValueChange={v => setInvoice({...invoice, id_cliente: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-black font-medium h-11"><SelectValue placeholder="Selecione o Cliente" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {clientes.map(c => <SelectItem key={c.id} value={String(c.id)} className="text-black">{c.nome || c.razao_social}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm shadow-slate-200">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-violet-700 font-bold"><Package className="w-5 h-5" /> Itens da Nota</CardTitle>
              <Select onValueChange={addItem}>
                <SelectTrigger className="w-64 bg-violet-50 border-none text-black font-semibold h-10">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {produtos.map(p => <SelectItem key={p.id} value={String(p.id)} className="text-black">{p.descricao}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Descrição</TableHead>
                    <TableHead className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Qtd</TableHead>
                    <TableHead className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Unitário (R$)</TableHead>
                    <TableHead className="text-slate-400 text-[10px] uppercase font-bold tracking-widest text-right">Total Item</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.itens.map((item, idx) => (
                    <TableRow key={idx} className="border-none hover:bg-slate-50/50">
                      <TableCell className="font-bold text-black text-sm">{item.descricao}</TableCell>
                      <TableCell>
                        <Input type="number" value={item.quantidade} onChange={e => updateItem(idx, 'quantidade', Number(e.target.value))} className="h-9 w-20 border-slate-200 text-black font-black text-center" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" value={item.valor_unitario} onChange={e => updateItem(idx, 'valor_unitario', Number(e.target.value))} className="h-9 border-slate-200 text-black font-medium" />
                      </TableCell>
                      <TableCell className="text-right font-black text-violet-700 italic">R$ {item.subtotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setInvoice({...invoice, itens: invoice.itens.filter((_, i) => i !== idx)})}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* RODAPÉ DE RESUMO DE IMPOSTOS */}
              <div className="mt-8 flex justify-between items-center bg-white p-5 rounded-xl border border-slate-50 shadow-inner">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BASE ICMS</p>
                  <p className="text-sm font-bold text-black">R$ {totalProdutos.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">VALOR ICMS (18%)</p>
                  <p className="text-sm font-bold text-black">R$ {totalICMS.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">VALOR IPI (5%)</p>
                  <p className="text-sm font-bold text-black">R$ {totalIPI.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-tighter">TOTAL ITENS</p>
                  <p className="text-sm font-bold text-violet-700">R$ {totalProdutos.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm shadow-slate-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-violet-700 font-bold"><Truck className="w-5 h-5" /> Transporte</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Transportadora</label>
                <Select onValueChange={v => setInvoice({...invoice, id_transportadora: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-black font-medium h-11 rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {transportadoras.map(t => <SelectItem key={t.id} value={String(t.id)} className="text-black">{t.razao_social}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Valor do Frete (R$)</label>
                <Input type="number" placeholder="0,00" onChange={e => setInvoice({...invoice, valor_frete: Number(e.target.value)})} className="h-11 border-slate-200 text-black font-bold rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <div className="bg-violet-800 text-white rounded-[32px] p-10 shadow-xl shadow-violet-200 text-center space-y-1 border-b-8 border-violet-950">
            <p className="text-[11px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">TOTAL LÍQUIDO DA NOTA</p>
            <p className="text-5xl font-black italic tracking-tighter">R$ {totalNota.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}