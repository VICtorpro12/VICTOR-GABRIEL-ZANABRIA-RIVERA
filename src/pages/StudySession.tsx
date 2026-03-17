import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, saveProgress as saveProgressApi, logout } from '../auth';
import { GoogleGenAI, Type } from '@google/genai';
import { ArrowLeft, Send, CheckCircle2, XCircle, BookOpen, Trophy, LogOut } from 'lucide-react';

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    // Vite uses import.meta.env for environment variables
    // @ts-ignore
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("VITE_GEMINI_API_KEY is not defined in environment variables");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
  }
  return aiInstance;
};

interface Step {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface SessionData {
  steps: Step[];
  finalQuestion: string;
  finalOptions: string[];
  finalCorrectOptionIndex: number;
  fullExplanation: string;
}

export default function StudySession({ user, onLogout }: { user: User, onLogout: () => void }) {
  const { branch, topic } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [phase, setPhase] = useState<'input' | 'steps' | 'full_explanation' | 'final_question' | 'completed'>('input');

  const startSession = async () => {
    if (!problem.trim()) return;
    
    setLoading(true);
    try {
      const prompt = `
        Actúa como un tutor experto para el examen de admisión de la UDG.
        El estudiante está estudiando la rama "${branch}", tema "${topic}".
        El estudiante ha proporcionado el siguiente problema/ecuación: "${problem}".
        
        Tu tarea es guiar al estudiante paso a paso para resolverlo.
        NO le des la respuesta directamente.
        
        Divide la resolución en pasos lógicos (máximo 4 pasos).
        Para cada paso, formula una pregunta de opción múltiple (4 opciones) preguntando "cuál es el proceso con el que debes empezar" o "qué debes hacer a continuación".
        
        Después de los pasos, proporciona una explicación completa y detallada de todo el proceso.
        
        Finalmente, formula una pregunta de opción múltiple (4 opciones) para que el estudiante seleccione el resultado final correcto.
      `;

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "Pregunta sobre el siguiente paso a realizar." },
                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 opciones de respuesta." },
                    correctOptionIndex: { type: Type.INTEGER, description: "Índice de la opción correcta (0 a 3)." },
                    explanation: { type: Type.STRING, description: "Explicación detallada de por qué este paso es correcto." }
                  },
                  required: ["question", "options", "correctOptionIndex", "explanation"]
                }
              },
              fullExplanation: { type: Type.STRING, description: "Explicación detallada de todo el proceso de resolución." },
              finalQuestion: { type: Type.STRING, description: "Pregunta pidiendo el resultado final." },
              finalOptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 opciones de resultado final." },
              finalCorrectOptionIndex: { type: Type.INTEGER, description: "Índice de la opción correcta del resultado final (0 a 3)." }
            },
            required: ["steps", "fullExplanation", "finalQuestion", "finalOptions", "finalCorrectOptionIndex"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as SessionData;
      setSessionData(data);
      setPhase('steps');
      setCurrentStepIndex(0);
      setSelectedOption(null);
      setIsCorrect(null);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Hubo un error al generar la sesión de estudio. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (isCorrect !== null) return; // Already answered
    
    setSelectedOption(index);
    
    if (phase === 'steps' && sessionData) {
      const correct = index === sessionData.steps[currentStepIndex].correctOptionIndex;
      setIsCorrect(correct);
    } else if (phase === 'final_question' && sessionData) {
      const correct = index === sessionData.finalCorrectOptionIndex;
      setIsCorrect(correct);
    }
  };

  const nextStep = () => {
    if (!sessionData) return;
    
    if (phase === 'steps') {
      if (currentStepIndex < sessionData.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setPhase('full_explanation');
      }
    } else if (phase === 'full_explanation') {
      setPhase('final_question');
      setSelectedOption(null);
      setIsCorrect(null);
    } else if (phase === 'final_question') {
      saveProgress();
      setPhase('completed');
    }
  };

  const saveProgress = async () => {
    if (!user || !branch || !topic) return;
    
    try {
      await saveProgressApi(branch, topic, isCorrect ? 1 : 0, 1);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

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
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-xl text-slate-900">Sesión de Estudio</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">{topic}</h1>
            <p className="text-slate-500 font-medium">{branch}</p>
          </div>

          {phase === 'input' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Ingresa tu problema o ecuación</h2>
              <p className="text-slate-600 mb-6">
                Escribe el problema que quieres resolver. Te guiaré paso a paso preguntándote qué hacer a continuación.
              </p>
              
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Ej. 2x + 5 = 15"
                className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-6"
              />
              
              <button
                onClick={startSession}
                disabled={loading || !problem.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generando sesión...' : 'Comenzar a resolver'}
                {!loading && <Send className="w-5 h-5" />}
              </button>
            </div>
          )}

          {phase === 'steps' && sessionData && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-indigo-900">Paso {currentStepIndex + 1} de {sessionData.steps.length}</span>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Proceso</span>
              </div>
              
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{sessionData.steps[currentStepIndex].question}</h3>
                
                <div className="space-y-3 mb-8">
                  {sessionData.steps[currentStepIndex].options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === sessionData.steps[currentStepIndex].correctOptionIndex;
                    
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                    
                    if (isCorrect === null) {
                      btnClass += isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                    } else {
                      if (isCorrectOption) {
                        btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                      } else if (isSelected && !isCorrectOption) {
                        btnClass += "border-red-500 bg-red-50 text-red-900";
                      } else {
                        btnClass += "border-slate-200 opacity-50";
                      }
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isCorrect !== null}
                        className={btnClass}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{String.fromCharCode(65 + idx)}. {option}</span>
                          {isCorrect !== null && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {isCorrect !== null && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {isCorrect !== null && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-6 rounded-2xl mb-6 ${isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                      <h4 className={`font-bold mb-2 ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                      </h4>
                      <p className="text-slate-700">{sessionData.steps[currentStepIndex].explanation}</p>
                    </div>
                    
                    <button
                      onClick={nextStep}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'full_explanation' && sessionData && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-600 px-8 py-6 text-white text-center">
                <h2 className="text-2xl font-bold">Proceso Completo</h2>
                <p className="text-indigo-200 mt-2">Revisa la explicación detallada antes de resolverlo tú mismo.</p>
              </div>
              
              <div className="p-8">
                <div className="prose prose-indigo max-w-none mb-8 text-slate-700 whitespace-pre-wrap">
                  {sessionData.fullExplanation}
                </div>
                
                <button
                  onClick={nextStep}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  ¡Estoy listo para resolverlo!
                </button>
              </div>
            </div>
          )}

          {phase === 'final_question' && sessionData && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-indigo-900">Resolución Final</span>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Resultado</span>
              </div>
              
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{sessionData.finalQuestion}</h3>
                
                <div className="space-y-3 mb-8">
                  {sessionData.finalOptions.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === sessionData.finalCorrectOptionIndex;
                    
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                    
                    if (isCorrect === null) {
                      btnClass += isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                    } else {
                      if (isCorrectOption) {
                        btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                      } else if (isSelected && !isCorrectOption) {
                        btnClass += "border-red-500 bg-red-50 text-red-900";
                      } else {
                        btnClass += "border-slate-200 opacity-50";
                      }
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isCorrect !== null}
                        className={btnClass}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{String.fromCharCode(65 + idx)}. {option}</span>
                          {isCorrect !== null && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {isCorrect !== null && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {isCorrect !== null && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-6 rounded-2xl mb-6 ${isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                      <h4 className={`font-bold mb-2 ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                        {isCorrect ? '¡Excelente trabajo!' : 'No exactamente.'}
                      </h4>
                      <p className="text-slate-700">
                        {isCorrect 
                          ? 'Has resuelto el problema correctamente. Tu progreso ha sido guardado.' 
                          : `La respuesta correcta era la opción ${String.fromCharCode(65 + sessionData.finalCorrectOptionIndex)}.`}
                      </p>
                    </div>
                    
                    <button
                      onClick={nextStep}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Ver resultados
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'completed' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">¡Sesión Completada!</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Has terminado de repasar este problema. Tu progreso se ha guardado en tu perfil. Sigue practicando para asegurar tu lugar en la UDG.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setProblem('');
                    setSessionData(null);
                    setPhase('input');
                  }}
                  className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Resolver otro problema
                </button>
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Volver al Temario
                </Link>
              </div>
            </div>
          )}
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
