export default function handler(req, res) {
  // Retorna as variáveis de ambiente do Supabase para o frontend
  res.status(200).json({
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || ''
  });
}
