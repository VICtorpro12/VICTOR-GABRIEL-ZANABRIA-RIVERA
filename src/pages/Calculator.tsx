import { useState } from 'react';
import { User, logout } from '../auth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator as CalcIcon, LogOut } from 'lucide-react';

export default function Calculator({ user, onLogout }: { user: User, onLogout: () => void }) {
  const [gpa, setGpa] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');

  const calculateNeeded = () => {
    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 100) return null;

    const minScoreNum = parseFloat(minScore);
    if (isNaN(minScoreNum) || minScoreNum <= 0) return null;

    // The user wants to surpass the minimum score by 10 points
    const targetScore = minScoreNum + 10;
    const neededOnExam = targetScore - gpaNum;

    return {
      targetScore,
      neededOnExam: Math.max(0, neededOnExam)
    };
  };

  const result = calculateNeeded();

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <CalcIcon className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-xl text-slate-900">Calculadora</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver al Temario
          </Link>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalcIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Calculadora de Puntaje UDG</h1>
              <p className="text-indigo-100">Descubre cuánto necesitas sacar en tu examen PAA.</p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Promedio de Bachillerato (0 - 100)
                </label>
                <input
                  type="number"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="Ej. 85.5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Puntaje mínimo de tu carrera
                </label>
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  placeholder="Ej. 165.4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {result && (
                <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4 text-center">Tu Meta</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-sm text-slate-500 font-medium mb-1">Puntaje Objetivo</p>
                      <p className="text-2xl font-black text-slate-800">{result.targetScore.toFixed(2)}</p>
                      <p className="text-xs text-slate-400 mt-1">(Mínimo + 10 pts)</p>
                    </div>
                    
                    <div className="bg-indigo-600 p-4 rounded-xl shadow-sm text-white">
                      <p className="text-sm text-indigo-200 font-medium mb-1">Necesitas en el Examen</p>
                      <p className="text-3xl font-black">{result.neededOnExam.toFixed(2)}</p>
                      <p className="text-xs text-indigo-200 mt-1">puntos sobre 100</p>
                    </div>
                  </div>

                  {result.neededOnExam > 100 && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center">
                      El puntaje requerido supera los 100 puntos del examen. Necesitarías un promedio de bachillerato más alto.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="https://www.uteg.edu.mx/wp-content/uploads/2023/08/Logo-UTEG-2023.png" 
              alt="Logo UTEG" 
              className="h-8 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Logo_UTEG.png/800px-Logo_UTEG.png';
              }}
            />
            <span className="text-sm font-medium text-slate-500">Centro Universitario UTEG</span>
          </div>
          <p className="text-sm text-slate-500 text-center sm:text-right">
            Desarrollado por <span className="font-semibold text-slate-700">Víctor Gabriel Zanabria Rivera</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
