import { useState } from 'react';
import { loginWithGoogle, User } from '../auth';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-8">
          <img 
            src="https://www.uteg.edu.mx/wp-content/uploads/2023/08/Logo-UTEG-2023.png" 
            alt="Logo UTEG" 
            className="h-16 object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Logo_UTEG.png/800px-Logo_UTEG.png';
            }}
          />
        </div>
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Prep UDG</h1>
        <p className="text-slate-600 mb-8">
          Tu plataforma de estudio interactiva para el examen de admisión a la Universidad de Guadalajara.
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl px-6 py-3 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Desarrollado por <br/>
            <span className="font-semibold text-slate-800 text-base">Víctor Gabriel Zanabria Rivera</span>
          </p>
        </div>
      </div>
    </div>
  );
}
