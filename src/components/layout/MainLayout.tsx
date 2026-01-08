import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (

    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header /> 
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;