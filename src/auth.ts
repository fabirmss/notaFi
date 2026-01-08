import { supabase } from './lib/supabase';

export interface Usuario {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  role: 'ADMIN' | 'LOJISTA';
  idemitente: number | null;
}

// O erro principal estava aqui: Falta a palavra "export"
export function logout() {
  localStorage.removeItem('user_session');
  localStorage.removeItem('@NotaFiscal:user');
  window.location.href = "/";
}

export function getUsuarioLogado(): Usuario | null {
  const session = localStorage.getItem('user_session');
  return session ? JSON.parse(session) : null;
}

export async function login(identificador: string, senhaDigitada: string) {
  try {
    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, nome, usuario, email, senha, nivel_acesso, idemitente')
      .or(`email.eq.${identificador.trim()},usuario.eq.${identificador.trim()}`)
      .single();

    if (error || !user) return null;
    if (String(user.senha) !== String(senhaDigitada).trim()) return null;

    const sessionData: Usuario = {
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      role: user.nivel_acesso as 'ADMIN' | 'LOJISTA',
      idemitente: user.idemitente
    };

    localStorage.setItem('user_session', JSON.stringify(sessionData));
    return sessionData;
  } catch (err) {
    return null;
  }
}