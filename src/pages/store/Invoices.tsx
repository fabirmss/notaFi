import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUsuarioLogado } from '@/auth';
import { FileText, Plus, Loader2, Package, Calculator, X, User, Building2, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function Invoices() {
  const { toast } = useToast();
  const usuario = getUsuarioLogado();

  const [dbInvoices, setDbInvoices] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [transportadoras, setTransportadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'PF' | 'PJ'>('PF');

  const [novaNota, setNovaNota] = useState({
    numeronota: Math.floor(Math.random() * 90000) + 10000,
    idcliente: '',
    idtransportadora: '',
    naturezaoperacao: 'Venda de Mercadoria',
  });

  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);

  /* ================= FETCH DATA WITH NORMALIZATION ================= */
  async function fetchData() {
    try {
      setLoading(true);
      const idEmitente = usuario?.idemitente || usuario?.id_emitente || 1;

      // Fetching all data in parallel
      const [resNotas, resProd, resPF, resPJ, resTransp] = await Promise.all([
        supabase.from('nota_fiscal').select('*').eq('idemitente', idEmitente).order('dataemissao', { ascending: false }),
        supabase.from('produto').select('*').eq('idemitente', idEmitente),
        supabase.from('cliente_pf').select('*').eq('idemitente', idEmitente),
        supabase.from('cliente_pj').select('*').eq('idemitente', idEmitente),
        supabase.from('transportadora').select('*').eq('idemitente', idEmitente)
      ]);

      // Product normalization - Fixes the "undefined" error in Selects
      const normalProd = (resProd.data || []).map(p => ({
        id: String(p.id || p.idproduto),
        nome: String(p.nome || p.descricao || "Produto"),
        preco: Number(p.preco || p.valor_unitario || 0),
        icms: Number(p.aliq_icms || p.icms || 18),
        ipi: Number(p.aliq_ipi || p.ipi || 0)
      }));

      const normalPF = (resPF.data || []).map(i => ({ id: String(i.id || i.idcliente_pf), nome: i.nome, tipo: 'PF' }));
      const normalPJ = (resPJ.data || []).map(i => ({ id: String(i.id || i.idcliente_pj), nome: i.nome, tipo: 'PJ' }));

      setProdutos(normalProd);
      setClientes([...normalPF, ...normalPJ]);
      setTransportadoras((resTransp.data || []).map(t => ({ id: String(t.id || t.idtransportadora), nome: t.nome })));
      setDbInvoices(resNotas.data || []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { fetchData(); }, []);

  /* ================= AUTOMATED CALCULATIONS ================= */
  const adicionarItem = () => {
    setItensCarrinho([...itensCarrinho, { 
      idproduto: '', 
      quantidade: 1, 
      valorunitario: 0, 
      valortotal: 0,
      aliqIcms: 0, 
      aliqIpi: 0 
    }]);
  };

  const atualizarItem = (index: number, idProd: string) => {
    const p = produtos.find(item => item.id === idProd);
    if (!p) return;
    
    const lista = [...itensCarrinho];
    lista[index] = {
        ...lista[index],
        idproduto: idProd,
        valorunitario: p.preco, 
        aliqIcms: p.icms,       
        aliqIpi: p.ipi,         
        valortotal: p.preco * lista[index].quantidade
    };
    setItensCarrinho(lista);
  };

  const atualizarQuantidade = (index: number, q: number) => {
    const lista = [...itensCarrinho];
    const qtd = q < 1 ? 1 : q;
    lista[index].quantidade = qtd;
    lista[index].valortotal = qtd * lista[index].valorunitario;
    setItensCarrinho(lista);
  };

  const subtotalProd = itensCarrinho.reduce((acc, i) => acc + i.valortotal, 0);
  const totalIcms = itensCarrinho.reduce((acc, i) => acc + (i.valortotal * (i.aliqIcms / 100)), 0);
  const totalIpi = itensCarrinho.reduce((acc, i) => acc + (i.valortotal * (i.aliqIpi / 100)), 0);
  const totalNota = subtotalProd + totalIpi;

  /* ================= RENDER ================= */
  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-violet-600" /> Notas Fiscais</h1>
        <Button onClick={() => { setIsCreateModalOpen(true); setItensCarrinho([]); }} className="bg-violet-600">Nova Nota</Button>
      </div>

      <Card className="bg-white rounded-xl shadow-sm border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="px-6">Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right px-6">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbInvoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell className="px-6 font-bold">#{inv.numeronota}</TableCell>
                <TableCell>{clientes.find(c => c.id === String(inv.idcliente))?.nome || '---'}</TableCell>
                <TableCell className="text-right px-6 font-bold text-violet-700">R$ {inv.valortotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-5xl bg-white border-none shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-violet-700 font-black flex items-center gap-2 uppercase"><Calculator /> Emissão Automática</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-slate-400">Destinatário</Label>
                <div className="flex gap-2 mb-2">
                  <Button variant={filtroTipo === 'PF' ? "default" : "outline"} size="sm" onClick={() => setFiltroTipo('PF')} className={filtroTipo === 'PF' ? "bg-violet-600 h-8" : "h-8"}>PF</Button>
                  <Button variant={filtroTipo === 'PJ' ? "default" : "outline"} size="sm" onClick={() => setFiltroTipo('PJ')} className={filtroTipo === 'PJ' ? "bg-violet-600 h-8" : "h-8"}>PJ</Button>
                </div>
                <Select value={novaNota.idcliente} onValueChange={(v) => setNovaNota({ ...novaNota, idcliente: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {clientes.filter(c => c.tipo === filtroTipo).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 pt-12">
                <Label className="text-xs font-bold uppercase text-slate-400">Transporte</Label>
                <Select value={novaNota.idtransportadora} onValueChange={(v) => setNovaNota({ ...novaNota, idtransportadora: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Opcional..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {transportadoras.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-2xl p-4 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-700 text-xs uppercase flex items-center gap-2"><Package size={16} /> Itens e Tributação Automática</span>
                <Button size="sm" onClick={adicionarItem} className="bg-violet-600 text-white font-bold">+ Adicionar Produto</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px] uppercase border-none">
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center w-24">Qtd</TableHead>
                    <TableHead className="text-right">Unitário</TableHead>
                    <TableHead className="text-center w-20">ICMS %</TableHead>
                    <TableHead className="text-center w-20">IPI %</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensCarrinho.map((item, idx) => (
                    <TableRow key={`item-${idx}`} className="bg-white border-b border-slate-50 last:border-none">
                      <TableCell>
                        <Select value={item.idproduto} onValueChange={(id) => atualizarItem(idx, id)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Escolha..." /></SelectTrigger>
                          <SelectContent className="bg-white">
                            {produtos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input type="number" value={item.quantidade} onChange={e => atualizarQuantidade(idx, Number(e.target.value))} className="h-8 text-center text-xs font-bold" /></TableCell>
                      <TableCell className="text-right text-xs font-bold">R$ {item.valorunitario.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-xs text-blue-600 font-bold">{item.aliqIcms}%</TableCell>
                      <TableCell className="text-center text-xs text-orange-600 font-bold">{item.aliqIpi}%</TableCell>
                      <TableCell className="text-right font-black text-violet-700 font-mono">R$ {item.valortotal.toFixed(2)}</TableCell>
                      <TableCell><X size={14} className="text-red-400 cursor-pointer" onClick={() => setItensCarrinho(itensCarrinho.filter((_, i) => i !== idx))} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-8 border-t flex justify-between items-center rounded-b-2xl">
            <div className="grid grid-cols-2 gap-10 text-left">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Resumo ICMS</p>
                <p className="text-xl font-bold text-blue-700 font-mono">R$ {totalIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Resumo IPI</p>
                <p className="text-xl font-bold text-orange-700 font-mono">R$ {totalIpi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Líquido da Nota</p>
              <div className="font-black text-violet-700 text-4xl font-mono tracking-tighter">
                R$ {totalNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <Button disabled={saving} className="bg-violet-600 mt-2 px-12 h-14 font-black rounded-xl shadow-xl hover:scale-105 transition-all">
                {saving ? <Loader2 className="animate-spin" /> : 'FINALIZAR NOTA'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}