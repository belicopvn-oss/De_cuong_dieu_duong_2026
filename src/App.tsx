import { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, History, Trash2, ArrowLeft, RefreshCw, Star, BarChart, BookMarked, Sparkles } from 'lucide-react';
import { Question, Part, QuestionStat, StudyHistory } from './types';
import Header from './components/Header';
import PartSelector from './components/PartSelector';
import QuizCard from './components/QuizCard';
import ReviewPanel from './components/ReviewPanel';
import HistoryPanel from './components/HistoryPanel';

// Import our 800 questions database
import questionsDataRaw from './data/questions.json';

const questionsData = questionsDataRaw as Question[];

const parts: Part[] = [
  { id: 1, name: "Phần 1: Câu 1 - 100", startId: 1, endId: 100 },
  { id: 2, name: "Phần 2: Câu 101 - 200", startId: 101, endId: 200 },
  { id: 3, name: "Phần 3: Câu 201 - 300", startId: 201, endId: 300 },
  { id: 4, name: "Phần 4: Câu 301 - 400", startId: 301, endId: 400 },
  { id: 5, name: "Phần 5: Câu 401 - 500", startId: 401, endId: 500 },
  { id: 6, name: "Phần 6: Câu 501 - 600", startId: 501, endId: 600 },
  { id: 7, name: "Phần 7: Câu 601 - 700", startId: 601, endId: 700 },
  { id: 8, name: "Phần 8: Câu 701 - 800", startId: 701, endId: 800 },
];

export default function App() {
  // --- Dark Mode ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('quiz_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('quiz_dark_mode', String(darkMode));
  }, [darkMode]);

  // --- Main Tabs ---
  const [activeTab, setActiveTab] = useState<'study' | 'review' | 'history'>('study');

  // --- User Study & Weak Point Progress States ---
  const [stats, setStats] = useState<{ [questionId: number]: QuestionStat }>(() => {
    const saved = localStorage.getItem('quiz_stats');
    return saved ? JSON.parse(saved) : {};
  });

  const [history, setHistory] = useState<StudyHistory[]>(() => {
    const saved = localStorage.getItem('quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProgress, setUserProgress] = useState<{ [partId: number]: number }>(() => {
    const saved = localStorage.getItem('quiz_user_progress');
    return saved ? JSON.parse(saved) : {};
  });

  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem('quiz_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('quiz_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('quiz_user_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // --- Quiz Session ---
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionWrongCount, setSessionWrongCount] = useState<number>(0);
  const [sessionAnswers, setSessionAnswers] = useState<{ [questionId: number]: string }>({});
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Completion results summary modal
  const [completedResults, setCompletedResults] = useState<{
    partId: number;
    partName: string;
    score: number;
    total: number;
    duration: number;
  } | null>(null);

  // Filter questions for active study part
  const activePart = parts.find(p => p.id === selectedPartId);
  const activeQuestions = activePart
    ? questionsData.filter(q => q.id >= activePart.startId && q.id <= activePart.endId)
    : [];

  const handleSelectPart = (partId: number) => {
    setSelectedPartId(partId);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setSessionScore(0);
    setSessionWrongCount(0);
    setSessionAnswers({});
    setSessionStartTime(Date.now());
    setCompletedResults(null);
  };

  const handleSelectOption = (letter: string) => {
    if (isAnswered) return;

    const currentQuestion = activeQuestions[currentIndex];
    setSelectedAnswer(letter);
    setIsAnswered(true);

    const isCorrect = letter === currentQuestion.answer;
    const newAnswers = { ...sessionAnswers, [currentQuestion.id]: letter };
    setSessionAnswers(newAnswers);

    if (isCorrect) {
      setSessionScore(prev => prev + 1);
    } else {
      setSessionWrongCount(prev => prev + 1);
    }

    // Update global question stats (wrong tracking and total attempts)
    setStats(prev => {
      const qStat = prev[currentQuestion.id] || {
        questionId: currentQuestion.id,
        wrongCount: 0,
        totalAttempts: 0,
        lastAttemptTime: new Date().toISOString(),
      };

      return {
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          wrongCount: isCorrect ? qStat.wrongCount : qStat.wrongCount + 1,
          totalAttempts: qStat.totalAttempts + 1,
          lastAttemptTime: new Date().toISOString(),
        }
      };
    });

    // Update total completed questions in this part
    setUserProgress(prev => {
      const currentAnswered = prev[selectedPartId!] || 0;
      const count = Object.keys(newAnswers).length;
      return {
        ...prev,
        [selectedPartId!]: Math.max(currentAnswered, count),
      };
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Restore state if already answered in this session, otherwise reset
      const nextQuestionId = activeQuestions[nextIndex].id;
      const savedAns = sessionAnswers[nextQuestionId];
      if (savedAns) {
        setSelectedAnswer(savedAns);
        setIsAnswered(true);
      } else {
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevQuestionId = activeQuestions[prevIndex].id;
      const savedAns = sessionAnswers[prevQuestionId];
      setSelectedAnswer(savedAns || null);
      setIsAnswered(savedAns !== undefined);
    }
  };

  const handleFinishQuiz = () => {
    if (!selectedPartId || !activePart) return;

    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    const newHistory: StudyHistory = {
      id: Math.random().toString(36).substr(2, 9),
      partId: selectedPartId,
      partName: activePart.name,
      score: sessionScore,
      totalQuestions: activeQuestions.length,
      completedAt: new Date().toISOString(),
      durationSeconds: duration
    };

    setHistory(prev => [newHistory, ...prev]);

    setCompletedResults({
      partId: selectedPartId,
      partName: activePart.name,
      score: sessionScore,
      total: activeQuestions.length,
      duration: duration
    });

    // Reset session
    setSelectedPartId(null);
  };

  const handleAnswerQuestionInReview = (questionId: number, isCorrect: boolean) => {
    // Allows answering from review list
    setStats(prev => {
      const qStat = prev[questionId];
      if (!qStat) return prev;

      // Decrement mistake count when successfully cleared
      const updatedWrongCount = isCorrect 
        ? Math.max(0, qStat.wrongCount - 1) 
        : qStat.wrongCount + 1;

      return {
        ...prev,
        [questionId]: {
          ...qStat,
          wrongCount: updatedWrongCount,
          totalAttempts: qStat.totalAttempts + 1,
          lastAttemptTime: new Date().toISOString()
        }
      };
    });
  };

  const totalWrongCount = (Object.values(stats) as QuestionStat[]).filter(s => s.wrongCount > 0).length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'study') {
            setSelectedPartId(null);
            setCompletedResults(null);
            setActiveTab('study');
          } else {
            setSelectedPartId(null);
            setActiveTab(tab);
          }
        }}
        onLogoClick={() => {
          setSelectedPartId(null);
          setCompletedResults(null);
          setActiveTab('study');
        }}
        wrongCount={totalWrongCount}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8">
        
        {/* Study Tab View */}
        {activeTab === 'study' && (
          <div className="space-y-6">
            
            {/* Completion Results Modal / View */}
            {completedResults && (
              <div id="completion-view" className="p-6 sm:p-8 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-500/5 dark:bg-emerald-950/10 max-w-2xl mx-auto text-center space-y-6 shadow-sm">
                <div className="mx-auto h-16 w-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center animate-bounce">
                  <Award className="h-10 w-10" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                    Chúc mừng bạn đã hoàn thành phần ôn tập!
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                    {completedResults.partName}
                  </p>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-2xl">
                    <span className="text-[10px] uppercase font-mono text-neutral-400">Kết quả</span>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                      {completedResults.score} / {completedResults.total}
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-2xl">
                    <span className="text-[10px] uppercase font-mono text-neutral-400">Tỷ lệ đúng</span>
                    <p className="text-xl font-bold text-emerald-500 mt-1">
                      {Math.round((completedResults.score / completedResults.total) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                  <button
                    id="btn-return-selector"
                    onClick={() => setCompletedResults(null)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại danh sách</span>
                  </button>

                  <button
                    id="btn-retry-part"
                    onClick={() => handleSelectPart(completedResults.partId)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-sm shadow-rose-500/10 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Làm lại phần này</span>
                  </button>
                </div>
              </div>
            )}

            {/* Part Selection Screen */}
            {!selectedPartId && !completedResults && (
              <div className="space-y-6">
                
                {/* Visual Banner */}
                <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/10 dark:border-rose-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider font-mono">Quá trình luyện thi xuất sắc</span>
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                      Mở khoá thành công Đề thi lý thuyết 2026!
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
                      Bộ đề thi được xây dựng chuyên môn cao dựa trên Chuẩn đạo đức nghề nghiệp, Quy tắc ứng xử cơ sở y tế, Quy định kiểm soát nhiễm khuẩn của Bộ Y Tế.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-mono text-neutral-400">Đã học</span>
                      <p className="text-base sm:text-lg font-bold text-rose-500 mt-0.5">
                        {(Object.values(userProgress) as number[]).reduce((acc, curr) => acc + curr, 0)} / 800
                      </p>
                    </div>
                    <div className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-mono text-neutral-400">Yếu điểm</span>
                      <p className="text-base sm:text-lg font-bold text-amber-500 mt-0.5">
                        {totalWrongCount} câu
                      </p>
                    </div>
                  </div>
                </div>

                <PartSelector
                  parts={parts}
                  selectedPartId={selectedPartId || 0}
                  onSelectPart={handleSelectPart}
                  userProgress={userProgress}
                  stats={stats}
                />
              </div>
            )}

            {/* Quiz Active Card View */}
            {selectedPartId && activePart && (
              <div className="space-y-4 max-w-3xl mx-auto">
                
                {/* Exit back button */}
                <button
                  id="btn-quit-quiz"
                  onClick={() => {
                    setSelectedPartId(null);
                  }}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors py-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại danh sách</span>
                </button>

                <QuizCard
                  question={activeQuestions[currentIndex]}
                  currentIndex={currentIndex}
                  totalInPart={activeQuestions.length}
                  selectedAnswer={selectedAnswer}
                  isAnswered={isAnswered}
                  onSelectOption={handleSelectOption}
                  onNext={handleNextQuestion}
                  onPrevious={handlePreviousQuestion}
                  onFinish={handleFinishQuiz}
                  partName={activePart.name}
                />
              </div>
            )}

          </div>
        )}

        {/* Incorrect/Review Tab View */}
        {activeTab === 'review' && (
          <div className="max-w-4xl mx-auto">
            <ReviewPanel
              questions={questionsData}
              stats={stats}
              onResetStats={() => setStats({})}
              onAnswerQuestion={handleAnswerQuestionInReview}
            />
          </div>
        )}

        {/* History Tab View */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto">
            <HistoryPanel
              history={history}
              onClearHistory={() => setHistory([])}
            />
          </div>
        )}

      </main>

      {/* Humble aesthetic page footer */}
      <footer id="app-footer" className="w-full border-t border-neutral-200 dark:border-neutral-900 py-6 text-center text-xs text-neutral-400 dark:text-neutral-500 font-mono">
        <div className="max-w-5xl mx-auto px-4">
          <span>Trang web ôn luyện lý thuyết điều dưỡng quốc gia &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>

    </div>
  );
}
