import { useState } from 'react';
import { login } from '../auth'; // Importa a lógica que criamos

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // O 'await' é essencial para esperar o Supabase responder
      const usuario = await login(user, pass);
      
      if (usuario) {
        onLoginSuccess(); // Sucesso: Avisa o App.tsx para liberar o sistema
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900"> Nota Fiscal </h2>
          <p className="mt-2 text-sm text-gray-600">Entre com sua conta para gerenciar notas</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário</label>
              <input
                type="text"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loading ? 'Verificando...' : 'Entrar no Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}