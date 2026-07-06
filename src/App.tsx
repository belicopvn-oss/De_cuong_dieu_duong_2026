import { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, History, Trash2, ArrowLeft, RefreshCw, Star, BarChart, BookMarked, Sparkles } from 'lucide-react';
import { Question, Part, QuestionStat, StudyHistory } from './types';
import Header from './components/Header';
import PartSelector from './components/PartSelector';
import QuizCard from './components/QuizCard';
import ReviewPanel from './components/ReviewPanel';
import HistoryPanel from './components/HistoryPanel';

// Import our 272 questions database
import questionsDataRaw from './data/questions.json';

const questionsData = questionsDataRaw as Question[];

const parts: Part[] = [
  { id: 1, name: "Phần 1: Câu 1 - 76 (Điều dưỡng cơ bản)", startId: 1, endId: 76 },
  { id: 2, name: "Phần 2: Câu 77 - 189 (Cấp cứu & Hồi sức)", startId: 77, endId: 189 },
  { id: 3, name: "Phần 3: Câu 190 - 272 (Kiểm soát nhiễm khuẩn)", startId: 190, endId: 272 },
  { id: 4, name: "Phần 4: Câu 273 - 420 (Nội khoa & Cấp cứu)", startId: 273, endId: 420 },
  { id: 5, name: "Phần 5: Câu 421 - 560 (Sản khoa & Nhi khoa)", startId: 421, endId: 560 },
  { id: 6, name: "Phần 6: Câu 561 - 700 (Gây mê, Hồi sức & Xét nghiệm)", startId: 561, endId: 700 },
  { id: 7, name: "Phần 7: Câu 701 - 800 (Vi sinh & KSNK nâng cao)", startId: 701, endId: 800 },
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
  const [sessionAnswers, setSessionAnswers] = useState<{ [questionId: number]: string }>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);
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
    setSessionAnswers({});
    setIsGraded(false);
    setSessionStartTime(Date.now());
    setCompletedResults(null);
  };

  const handleSelectOption = (questionId: number, letter: string) => {
    if (isGraded) return;

    const newAnswers = { ...sessionAnswers, [questionId]: letter };
    setSessionAnswers(newAnswers);

    // Update total completed questions in this part (real-time progress bar)
    setUserProgress(prev => {
      const count = Object.keys(newAnswers).length;
      return {
        ...prev,
        [selectedPartId!]: count,
      };
    });
  };

  const handleGradeQuiz = () => {
    if (!selectedPartId || !activePart) return;

    let score = 0;
    const newStats = { ...stats };

    activeQuestions.forEach(question => {
      const userAnswer = sessionAnswers[question.id];
      const isCorrect = userAnswer === question.answer;

      if (isCorrect) {
        score++;
      }

      // Update question stats
      const qStat = newStats[question.id] || {
        questionId: question.id,
        wrongCount: 0,
        totalAttempts: 0,
        lastAttemptTime: new Date().toISOString(),
      };

      newStats[question.id] = {
        questionId: question.id,
        wrongCount: isCorrect ? qStat.wrongCount : qStat.wrongCount + 1,
        totalAttempts: qStat.totalAttempts + 1,
        lastAttemptTime: new Date().toISOString(),
      };
    });

    setStats(newStats);

    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    const newHistory: StudyHistory = {
      id: Math.random().toString(36).substr(2, 9),
      partId: selectedPartId,
      partName: activePart.name,
      score: score,
      totalQuestions: activeQuestions.length,
      completedAt: new Date().toISOString(),
      durationSeconds: duration
    };

    setHistory(prev => [newHistory, ...prev]);
    setIsGraded(true);

    // Lock progress to 100% / total questions on grade
    setUserProgress(prev => ({
      ...prev,
      [selectedPartId]: activeQuestions.length,
    }));
  };

  const handleResetQuiz = () => {
    setSessionAnswers({});
    setIsGraded(false);
    setSessionStartTime(Date.now());
  };

  const handleBackToPartList = () => {
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
        totalQuestions={questionsData.length}
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
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-400">Đã học</span>
                        <p className="text-base sm:text-lg font-bold text-rose-500 mt-0.5">
                          {(Object.values(userProgress) as number[]).reduce((acc, curr) => acc + curr, 0)} / {questionsData.length}
                        </p>
                      </div>
                      <div className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-400">Yếu điểm</span>
                        <p className="text-base sm:text-lg font-bold text-amber-500 mt-0.5">
                          {totalWrongCount} câu
                        </p>
                      </div>
                    </div>
                    <button
                      id="btn-reset-app-state"
                      onClick={() => {
                        if (confirm("Bạn có chắc chắn muốn xoá toàn bộ tiến trình học, lịch sử thi và đặt lại ứng dụng không?")) {
                          localStorage.clear();
                          setStats({});
                          setHistory([]);
                          setUserProgress({});
                          setSelectedPartId(null);
                          setCompletedResults(null);
                          window.location.reload();
                        }
                      }}
                      className="text-[10px] font-mono text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors flex items-center gap-1 mt-1 font-semibold self-end"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Xoá tiến trình & Đặt lại</span>
                    </button>
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

            {/* Quiz Active Scrollable View */}
            {selectedPartId && activePart && (
              <div className="max-w-3xl mx-auto">
                <QuizCard
                  questions={activeQuestions}
                  sessionAnswers={sessionAnswers}
                  isGraded={isGraded}
                  onSelectOption={handleSelectOption}
                  onGrade={handleGradeQuiz}
                  onReset={handleResetQuiz}
                  onBack={handleBackToPartList}
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
