import { useState, useEffect } from 'react';
import { User, logout, getProgress } from '../auth';
import { Link } from 'react-router-dom';
import { Calculator, LogOut, ChevronRight, BookOpen } from 'lucide-react';

const syllabus = [
  {
    name: 'Aritmética',
    topics: ['Conjuntos numéricos', 'Suma y resta', 'Multiplicación', 'Operaciones con decimales', 'Múltiplos y divisores', 'Criterios de divisibilidad', 'Mínimo común múltiplo', 'Máximo común divisor', 'Raíz cuadrada', 'Jerarquía de operaciones', 'Notaciones']
  },
  {
    name: 'Fracciones',
    topics: ['Definición de fracción', 'Simplificación de fracciones', 'Fracciones propias e impropias', 'Suma y resta de fracciones', 'Multiplicación de fracciones', 'División de fracciones', 'Problemas con fracciones']
  },
  {
    name: 'Regla de tres',
    topics: ['Regla de tres directa', 'Regla de tres inversa', 'Uso y obstáculos de datos', 'Varias reglas de tres', 'Porcentajes']
  },
  {
    name: 'Álgebra',
    topics: ['Conceptos básicos', 'Suma y resta algebraica', 'Multiplicación algebraica', 'División algebraica', 'Leyes de los exponentes', 'Factorización', 'Sustitución algebraica', 'Ecuaciones cuadráticas', 'División polinómica', 'División sintética', 'Operador matemático', 'Despejes', 'Planteamiento de ecuaciones', 'Ecuaciones simultáneas', 'Criterios de ecuaciones', 'Inecuaciones', 'Funciones']
  },
  {
    name: 'Geometría',
    topics: ['Ángulos', 'Ángulos en polígonos', 'Ángulos en paralelas', 'Triángulos', 'Teorema de Pitágoras', 'Cuadrados y rectángulos', 'Polígonos regulares', 'Figuras irregulares', 'Círculo', 'Área sombreada', 'Volúmenes', 'Área superficial', 'Despeje de fórmulas', 'Crecimiento proporcional', 'Visualización geométrica', 'Plano cartesiano']
  },
  {
    name: 'Temas variados',
    topics: ['Valor absoluto', 'Ecuaciones con valor absoluto', 'Inecuaciones con valor absoluto', 'Operaciones con raíces', 'Ecuaciones con raíces', 'Combinatoria', 'Probabilidad', 'Conjuntos', 'Estadística', 'Medidas de dispersión', 'Gráficas y tablas', 'Series']
  }
];

export default function Dashboard({ user, onLogout }: { user: User, onLogout: () => void }) {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    
    getProgress()
      .then((data) => {
        const newProgress: Record<string, number> = {};
        data.forEach((item: any) => {
          newProgress[`${item.branch}-${item.topic}`] = item.correctAnswers || 0;
        });
        setProgress(newProgress);
      })
      .catch((err) => {
        console.error("Error fetching progress:", err);
      });
  }, [user]);

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
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl text-slate-900">Prep UDG</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/calculator" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              <Calculator className="w-4 h-4" />
              Calculadora de Puntaje
            </Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Hola, {user.displayName?.split(' ')[0] || 'Estudiante'}</h1>
          <p className="text-slate-600 mt-2">Selecciona un tema para comenzar a practicar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syllabus.map((branch, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-indigo-50 px-6 py-4 border-b border-slate-200">
                <h2 className="font-bold text-lg text-indigo-900">{branch.name}</h2>
              </div>
              <div className="p-6 flex-1 overflow-y-auto max-h-80">
                <ul className="space-y-3">
                  {branch.topics.map((topic, tIdx) => {
                    const score = progress[`${branch.name}-${topic}`] || 0;
                    return (
                      <li key={tIdx}>
                        <Link
                          to={`/study/${encodeURIComponent(branch.name)}/${encodeURIComponent(topic)}`}
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                        >
                          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{topic}</span>
                          <div className="flex items-center gap-3">
                            {score > 0 && (
                              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                {score} pts
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

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
