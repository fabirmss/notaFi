import { useRole } from '@/contexts/RoleContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { StoreDashboard } from './store/StoreDashboard';

const Index = () => {
  const { isAdmin } = useRole();

  return isAdmin ? <AdminDashboard /> : <StoreDashboard />;
};

export default Index;
