import { useState } from 'react';
import { AlertCircle, Trash2, RefreshCw, CheckCircle, Check, X, ShieldAlert } from 'lucide-react';
import { Question, QuestionStat } from '../types';

interface ReviewPanelProps {
  questions: Question[];
  stats: { [questionId: number]: QuestionStat };
  onResetStats: () => void;
  onAnswerQuestion: (questionId: number, isCorrect: boolean) => void;
}

export default function ReviewPanel({
  questions,
  stats,
  onResetStats,
  onAnswerQuestion,
}: ReviewPanelProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Filter stats that have wrongCount > 0
  const wrongStats = Object.values(stats)
    .filter((stat) => stat.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount); // Sort by most wrong attempts first

  if (wrongStats.length === 0) {
    return (
      <div id="review-empty-state" className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/10 max-w-2xl mx-auto space-y-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
            Tuyệt vời! Không có câu hỏi nào bị sai
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            Học trình của bạn đang rất hoàn hảo. Khi bạn trả lời sai bất kỳ câu hỏi nào trong học phần, câu hỏi đó sẽ hiển thị ở đây kèm theo thống kê chi tiết để ôn tập.
          </p>
        </div>
      </div>
    );
  }

  // Find the question details for the list
  const wrongQuestionsList = wrongStats.map((stat) => {
    const q = questions.find((item) => item.id === stat.questionId);
    return {
      stat,
      question: q,
    };
  }).filter(item => item.question !== undefined) as { stat: QuestionStat; question: Question }[];

  const activeQuestion = wrongQuestionsList.find((item) => item.question.id === selectedQuestionId);

  const handlePracticeAnswer = (optionLetter: string, correctAnswer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(optionLetter);
    setIsAnswered(true);
    const isCorrect = optionLetter === correctAnswer;
    onAnswerQuestion(selectedQuestionId!, isCorrect);
  };

  const handleNextPractice = () => {
    setSelectedQuestionId(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <div id="review-panel-dashboard" className="space-y-6">
      
      {/* Header and stats overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <span>Trọng tâm ôn tập ({wrongStats.length} câu hay sai)</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tập trung ôn tập những câu hỏi bạn đã từng trả lời sai nhiều nhất để tối ưu điểm số.
          </p>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Xác nhận xóa?</span>
            <button
              id="btn-reset-mistakes-confirm"
              onClick={() => {
                onResetStats();
                setConfirmReset(false);
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
            >
              Có, xóa
            </button>
            <button
              id="btn-reset-mistakes-cancel"
              onClick={() => setConfirmReset(false)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            id="btn-reset-mistakes"
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-950 bg-rose-50/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-fit shrink-0 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Xóa lịch sử lỗi</span>
          </button>
        )}
      </div>

      {/* Main Review Grid split: left side list of questions, right side practice pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left list of wrong questions */}
        <div className="lg:col-span-7 space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          {wrongQuestionsList.map(({ stat, question }) => {
            const isSelected = selectedQuestionId === question.id;
            return (
              <div
                key={question.id}
                id={`wrong-item-${question.id}`}
                onClick={() => {
                  setSelectedQuestionId(question.id);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 ring-1 ring-rose-500/30'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                      # {question.id}
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 font-mono">
                      Sai {stat.wrongCount} lần
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-relaxed">
                    {question.question}
                  </h4>
                  <span className="inline-block text-[10px] text-neutral-400 dark:text-neutral-500">
                    Phần {Math.ceil(question.id / 100)} • Tỷ lệ sai: {Math.round((stat.wrongCount / stat.totalAttempts) * 100)}%
                  </span>
                </div>
                
                <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
                  <RefreshCw className="h-4 w-4 animate-spin-hover" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Practice Pane */}
        <div className="lg:col-span-5">
          {activeQuestion ? (
            <div id="practice-card" className="bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-950/50 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
                <span className="text-xs font-mono font-bold text-rose-500">
                  Luyện tập khắc phục sai lầm
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Câu hỏi # {activeQuestion.question.id}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-relaxed">
                  {activeQuestion.question.question}
                </p>

                {/* Options grid for quick practice */}
                <div className="space-y-2 pt-2">
                  {activeQuestion.question.options.map((option, idx) => {
                    const letter = option.charAt(0);
                    const optionText = option.substring(2).trim();
                    const isSelected = selectedAnswer === letter;
                    const isCorrect = activeQuestion.question.answer === letter;

                    let btnClass = "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700";
                    let letterClass = "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400";
                    let icon = null;

                    if (isAnswered) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-semibold";
                        letterClass = "bg-emerald-500 text-white";
                        icon = <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
                      } else if (isSelected) {
                        btnClass = "border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-300";
                        letterClass = "bg-rose-500 text-white";
                        icon = <X className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
                      } else {
                        btnClass = "border-neutral-100 dark:border-neutral-850 opacity-40";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        id={`practice-option-${idx}`}
                        disabled={isAnswered}
                        onClick={() => handlePracticeAnswer(letter, activeQuestion.question.answer)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs sm:text-sm transition-all duration-200 ${btnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-6.5 w-6.5 shrink-0 flex items-center justify-center rounded font-mono font-bold text-xs ${letterClass}`}>
                            {letter}
                          </span>
                          <span className="leading-snug">{optionText}</span>
                        </div>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="pt-3 border-t border-dashed border-neutral-100 dark:border-neutral-850 space-y-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {activeQuestion.question.explanation || "Hãy ghi nhớ kiến thức cốt lõi này để giải quyết các câu hỏi tương tự trong đề thi thật."}
                    </p>
                    <button
                      id="btn-next-practice"
                      onClick={handleNextPractice}
                      className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-95 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Ôn luyện câu khác</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div id="practice-prompt" className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/20 p-8 text-center text-neutral-500 space-y-2">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Bắt đầu luyện tập
                </h4>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-[240px] mx-auto leading-relaxed">
                  Chọn bất kỳ câu hỏi nào từ cột bên trái để bắt đầu luyện tập và khắc phục sai sót ngay.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
