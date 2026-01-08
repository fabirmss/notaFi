import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Users, Save, Loader2 } from 'lucide-react';

export function Clients() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [client, setClient] = useState({
    nome: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    municipio: '',
    uf: '',
    cep: ''
  });

  async function handleSave() {
    if (!client.nome || !client.cpf_cnpj) {
      toast({ title: "Erro", description: "Nome e CPF/CNPJ são obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('cliente').insert([client]);
      if (error) throw error;

      toast({ title: "Sucesso!", description: "Cliente cadastrado com sucesso." });
      setClient({ nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '', municipio: '', uf: '', cep: '' });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Cadastro de Clientes</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo / Razão Social</Label>
            <Input value={client.nome} onChange={e => setClient({...client, nome: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>CPF / CNPJ</Label>
            <Input value={client.cpf_cnpj} onChange={e => setClient({...client, cpf_cnpj: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          Salvar Cliente
        </Button>
      </div>
    </div>
  );
}