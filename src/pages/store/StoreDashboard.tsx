import {
  DollarSign,
  FileText,
  TrendingUp,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const stats = [
  {
    title: 'Faturamento Hoje',
    value: 'R$ 8.450,00',
    change: '+15%',
    icon: DollarSign,
  },
  {
    title: 'Notas Emitidas',
    value: '23',
    change: '+5',
    icon: FileText,
  },
  {
    title: 'Ticket Médio',
    value: 'R$ 367,39',
    change: '+8%',
    icon: TrendingUp,
  },
  {
    title: 'Itens Vendidos',
    value: '142',
    change: '+12%',
    icon: Package,
  },
];

const topProducts = [
  { name: 'Notebook Dell Inspiron 15', quantity: 12, revenue: 'R$ 35.880,00' },
  { name: 'Monitor LG 24"', quantity: 18, revenue: 'R$ 9.342,00' },
  { name: 'Teclado Mecânico RGB', quantity: 25, revenue: 'R$ 6.225,00' },
  { name: 'Mouse Gamer Logitech', quantity: 32, revenue: 'R$ 4.480,00' },
  { name: 'Headset Bluetooth JBL', quantity: 15, revenue: 'R$ 3.735,00' },
];

const recentNotes = [
  { number: 'NF-e 000.123.456', client: 'Tech Solutions LTDA', value: 'R$ 2.340,00', status: 'Autorizada' },
  { number: 'NF-e 000.123.455', client: 'Comercial ABC ME', value: 'R$ 890,00', status: 'Autorizada' },
  { number: 'NF-e 000.123.454', client: 'Distribuidora XYZ', value: 'R$ 5.670,00', status: 'Pendente' },
  { number: 'NF-e 000.123.453', client: 'Varejo Express', value: 'R$ 1.230,00', status: 'Autorizada' },
];

export function StoreDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard da Loja</h1>
          <p className="text-muted-foreground">Loja Central LTDA - CNPJ: 12.345.678/0001-90</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/notas/nova')}>
          <FileText className="w-4 h-4" />
          Nova Nota Fiscal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">{stat.change}</span>
                <span className="text-sm text-muted-foreground">vs. ontem</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Ranking do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}º</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} unidades</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notas Recentes</CardTitle>
              <CardDescription>Últimas notas emitidas</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/notas')}>
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div
                  key={note.number}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        note.status === 'Autorizada' ? 'bg-success/10' : 'bg-warning/10'
                      }`}
                    >
                      {note.status === 'Autorizada' ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{note.number}</p>
                      <p className="text-sm text-muted-foreground">{note.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{note.value}</p>
                    <span
                      className={`text-xs ${
                        note.status === 'Autorizada' ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {note.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="w-6 h-6 text-warning" />
            <div>
              <p className="font-medium text-foreground">Certificado Digital expira em 15 dias</p>
              <p className="text-sm text-muted-foreground">
                Renove seu certificado A1 para continuar emitindo notas fiscais
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Renovar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
