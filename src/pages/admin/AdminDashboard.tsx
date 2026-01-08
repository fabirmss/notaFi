import { Store, FileText, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Lojas Ativas',
    value: '47',
    change: '+12%',
    trend: 'up',
    icon: Store,
    description: 'vs. mês anterior',
  },
  {
    title: 'Notas Emitidas (Mês)',
    value: '12.847',
    change: '+8.2%',
    trend: 'up',
    icon: FileText,
    description: 'vs. mês anterior',
  },
  {
    title: 'Volume Processado',
    value: 'R$ 4.2M',
    change: '+23%',
    trend: 'up',
    icon: TrendingUp,
    description: 'vs. mês anterior',
  },
  {
    title: 'Usuários Ativos',
    value: '156',
    change: '-2%',
    trend: 'down',
    icon: Users,
    description: 'vs. mês anterior',
  },
];

const recentStores = [
  { name: 'Loja Central LTDA', cnpj: '12.345.678/0001-90', status: 'Ativo', notes: 342 },
  { name: 'Comercio Rápido ME', cnpj: '98.765.432/0001-10', status: 'Ativo', notes: 187 },
  { name: 'Super Mercado ABC', cnpj: '11.222.333/0001-44', status: 'Bloqueado', notes: 0 },
  { name: 'Distribuidora XYZ', cnpj: '55.666.777/0001-88', status: 'Ativo', notes: 521 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do sistema de emissão de notas fiscais</p>
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
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-success" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-destructive" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lojas Recentes</CardTitle>
            <CardDescription>Últimas lojas cadastradas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStores.map((store) => (
                <div
                  key={store.cnpj}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{store.name}</p>
                      <p className="text-sm text-muted-foreground">{store.cnpj}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        store.status === 'Ativo'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {store.status}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{store.notes} notas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade do Sistema</CardTitle>
            <CardDescription>Notas emitidas nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {[65, 45, 78, 92, 56, 84, 71].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t-md relative overflow-hidden"
                    style={{ height: `${value * 2}px` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all duration-500"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
