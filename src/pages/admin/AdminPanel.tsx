import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; 
import { logout } from '../../auth';
import { UserPlus, Shield, Trash2, Building, LogOut, Loader2, User, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

export function AdminPanel() {
  const { toast } = useToast();
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [emitentes, setEmitentes] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState<'LOJISTA' | 'ADMIN'>('LOJISTA');
  const [idEmitenteSelecionado, setIdEmitenteSelecionado] = useState('');

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    try {
      const { data: users } = await supabase.from('usuario').select('*');
      setListaUsuarios(users || []);

      const { data: emi } = await supabase.from('emitente').select('idemitente, nome_fantasia');
      setEmitentes(emi || []);
    } catch (error: any) {
      console.error(error);
    }
  }

  const handleCadastrar = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('usuario').insert([
        {
          nome,
          usuario: usuarioLogin,
          email,
          senha, 
          nivel_acesso: nivelAcesso,
          idemitente: nivelAcesso === 'ADMIN' ? null : parseInt(idEmitenteSelecionado) // Corrigido aqui
        }
      ]);

      if (error) throw error;
      toast({ title: "Sucesso!" });
      buscarDados();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-violet-600 p-3 rounded-xl text-white shadow-lg"><Shield size={24} /></div>
            <h1 className="text-xl font-bold text-slate-800">Contas de Acesso</h1>
          </div>
          <Button variant="outline" onClick={logout} className="text-red-600 border-red-100 font-bold"><LogOut size={18} className="mr-2" /> Sair</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-white p-6 space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase"><UserPlus size={16} className="text-violet-600" /> Novo Perfil</h3>
            <div className="space-y-3">
              <Input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
              <Input placeholder="Login" value={usuarioLogin} onChange={e => setUsuarioLogin(e.target.value)} />
              <Input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
              <Input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
              <select value={nivelAcesso} onChange={e => setNivelAcesso(e.target.value as any)} className="w-full border p-2 rounded-lg text-sm bg-white outline-none">
                <option value="LOJISTA">LOJISTA</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {nivelAcesso === 'LOJISTA' && (
                <select value={idEmitenteSelecionado} onChange={e => setIdEmitenteSelecionado(e.target.value)} className="w-full border-2 border-violet-100 p-2 rounded-lg bg-violet-50 text-sm font-bold text-violet-900">
                  <option value="">Selecione a Empresa...</option>
                  {emitentes.map(emi => (
                    <option key={emi.idemitente} value={emi.idemitente}>{emi.nome_fantasia}</option>
                  ))}
                </select>
              )}
              <Button onClick={handleCadastrar} disabled={loading} className="w-full bg-violet-600 font-bold py-6 text-white shadow-lg shadow-violet-100">
                {loading ? <Loader2 className="animate-spin" /> : "Gravar Conta"}
              </Button>
            </div>
          </Card>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b">
                <tr><th className="text-left py-4 px-6">Identificação</th><th className="text-left py-4 px-6">Unidade</th><th className="text-right py-4 px-6">Ação</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {listaUsuarios.map((u) => {
                  const empresa = emitentes.find(e => e.idemitente === u.idemitente); // Corrigido aqui
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{u.nome}</p>
                        <p className="text-[11px] text-slate-400">{u.email} ({u.usuario})</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.nivel_acesso === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.nivel_acesso}</span>
                        {empresa && <p className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-1"><Building size={12} /> {empresa.nome_fantasia}</p>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="ghost" size="sm" onClick={() => {}} className="text-slate-300 hover:text-red-600"><Trash2 size={18} /></Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}