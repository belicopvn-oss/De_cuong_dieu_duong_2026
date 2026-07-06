import { useState } from 'react';
import { Check, X, AlertCircle, Award, Sparkles, ChevronDown, ChevronUp, RefreshCw, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { Question } from '../types';

interface QuizCardProps {
  questions: Question[];
  sessionAnswers: { [questionId: number]: string };
  isGraded: boolean;
  onSelectOption: (questionId: number, optionLetter: string) => void;
  onGrade: () => void;
  onReset: () => void;
  onBack: () => void;
  partName: string;
}

export default function QuizCard({
  questions,
  sessionAnswers,
  isGraded,
  onSelectOption,
  onGrade,
  onReset,
  onBack,
  partName,
}: QuizCardProps) {
  const [showNavGrid, setShowNavGrid] = useState<boolean>(true);
  const [confirmGrade, setConfirmGrade] = useState<boolean>(false);

  // Helpers
  const getOptionLetter = (optionStr: string) => optionStr.charAt(0);
  const getOptionText = (optionStr: string) => optionStr.substring(2).trim();

  // Stats calculation
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(sessionAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Grade results
  const correctCount = questions.filter(q => sessionAnswers[q.id] === q.answer).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const handleScrollToQuestion = (qId: number) => {
    const el = document.getElementById(`question-card-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Quiz Section Header Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Đề cương ôn luyện 2026
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
              {partName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Hình thức học cuộn từ câu đầu tiên đến hết phần. Hãy trả lời các câu hỏi và bấm <strong className="text-rose-500 font-semibold">Chấm điểm</strong> ở cuối trang hoặc thanh trạng thái để xem kết quả.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Real-time stats display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-850">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 rounded-2xl text-center">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Tổng số câu</div>
            <div className="text-xl font-bold text-neutral-800 dark:text-white mt-0.5">{totalQuestions}</div>
          </div>
          <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-2xl text-center">
            <div className="text-[10px] font-mono text-rose-500 dark:text-rose-400 uppercase tracking-wider">Đã làm</div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{answeredCount}</div>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 rounded-2xl text-center">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Chưa làm</div>
            <div className="text-xl font-bold text-neutral-600 dark:text-neutral-400 mt-0.5">{unansweredCount}</div>
          </div>
          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl text-center">
            <div className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Chấm điểm</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {isGraded ? `${correctCount}/${totalQuestions}` : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Progress Grid panel */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <button
          onClick={() => setShowNavGrid(!showNavGrid)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-950/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-rose-500" />
            <h2 className="text-sm font-bold text-neutral-800 dark:text-white">
              Bảng điều hướng nhanh ({answeredCount}/{totalQuestions} câu)
            </h2>
          </div>
          {showNavGrid ? <ChevronUp className="h-4.5 w-4.5 text-neutral-500" /> : <ChevronDown className="h-4.5 w-4.5 text-neutral-500" />}
        </button>

        {showNavGrid && (
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-950/20 border-t border-neutral-100 dark:border-neutral-850">
            <div className="flex flex-wrap gap-2 justify-start max-h-60 overflow-y-auto pr-2">
              {questions.map((q, idx) => {
                const isAnswered = sessionAnswers[q.id] !== undefined;
                const isUserCorrect = isGraded && sessionAnswers[q.id] === q.answer;

                let btnClass = "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-rose-500 dark:hover:border-rose-500";
                
                if (isGraded) {
                  btnClass = isUserCorrect
                    ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                    : "bg-rose-500 text-white border-rose-500 hover:bg-rose-600";
                } else if (isAnswered) {
                  btnClass = "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 font-medium";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleScrollToQuestion(q.id)}
                    className={`h-9 w-9 text-xs font-mono rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 block" />
                <span>Chưa trả lời</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-rose-600 block" />
                <span>Đã trả lời</span>
              </div>
              {isGraded && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-emerald-500 block" />
                    <span>Trả lời đúng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-rose-500 block" />
                    <span>Trả lời sai / Bỏ sót</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Questions Scrolling List */}
      <div className="space-y-6">
        {questions.map((question, idx) => {
          const selectedAnswer = sessionAnswers[question.id] || null;
          const isTrueFalse = question.options.length === 2 && 
            (question.options[0].includes('Đúng') || question.options[1].includes('Sai'));

          return (
            <div
              key={question.id}
              id={`question-card-${question.id}`}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-5 scroll-mt-6 transition-all duration-300"
            >
              {/* Question card header */}
              <div className="flex items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-850 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg">
                    Câu {idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    ID: #{question.id}
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950/40 px-3 py-1 rounded-full">
                  {question.category || "Lý thuyết chung"}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-relaxed">
                {question.question}
              </h3>

              {/* Options selection */}
              <div className={`grid gap-3 ${isTrueFalse ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {question.options.map((option, optIdx) => {
                  const letter = getOptionLetter(option);
                  const text = getOptionText(option);
                  const isSelected = selectedAnswer === letter;
                  const isCorrectAnswer = question.answer === letter;

                  let btnClass = "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/20";
                  let letterClass = "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400";
                  let iconElement = null;

                  if (isGraded) {
                    if (isCorrectAnswer) {
                      btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-medium cursor-default";
                      letterClass = "bg-emerald-500 text-white";
                      iconElement = <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
                    } else if (isSelected) {
                      btnClass = "border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-300 cursor-default";
                      letterClass = "bg-rose-500 text-white";
                      iconElement = <X className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
                    } else {
                      btnClass = "border-neutral-100 dark:border-neutral-850 opacity-40 text-neutral-400 dark:text-neutral-500 cursor-default bg-transparent";
                      letterClass = "bg-neutral-50 dark:bg-neutral-900 text-neutral-350 dark:text-neutral-600";
                    }
                  } else if (isSelected) {
                    btnClass = "border-rose-600 bg-rose-500/5 dark:bg-rose-500/10 text-rose-900 dark:text-rose-100 font-medium";
                    letterClass = "bg-rose-600 text-white";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isGraded}
                      onClick={() => onSelectOption(question.id, letter)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left text-sm transition-all duration-200 ${
                        !isGraded && 'active:scale-99 hover:scale-[1.005]'
                      } ${btnClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-xl font-mono font-bold text-sm ${letterClass}`}>
                          {letter}
                        </span>
                        <span className="leading-relaxed">{text}</span>
                      </div>
                      {iconElement}
                    </button>
                  );
                })}
              </div>

              {/* Individual explanation block */}
              {isGraded && (
                <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                  selectedAnswer === question.answer
                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-950'
                    : 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-950'
                }`}>
                  <div className="flex items-start gap-3">
                    {selectedAnswer === question.answer ? (
                      <div className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 mt-0.5">
                        <Sparkles className="h-4.5 w-4.5" />
                      </div>
                    ) : (
                      <div className="p-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg shrink-0 mt-0.5">
                        <AlertCircle className="h-4.5 w-4.5" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h4 className={`text-sm font-semibold ${
                        selectedAnswer === question.answer ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'
                      }`}>
                        {selectedAnswer === question.answer 
                          ? 'Chính xác!' 
                          : selectedAnswer 
                            ? `Chưa chính xác. Đáp án đúng là: ${question.answer}`
                            : `Bạn đã bỏ qua câu hỏi này. Đáp án đúng là: ${question.answer}`
                        }
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1 font-sans">
                        {question.explanation || "Đáp án được trích xuất trực tiếp từ Đề cương ôn thi lý thuyết điều dưỡng quốc gia năm 2026."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Graded Summary Card at the bottom of the list */}
      {isGraded && (
        <div className="bg-gradient-to-br from-neutral-900 to-rose-950 dark:from-neutral-950 dark:to-neutral-900 border border-neutral-800 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Kết quả hoàn thành phần ôn tập</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Bạn vừa chấm điểm cho đề ôn luyện này</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
            <div className="space-y-1">
              <div className="text-xs text-neutral-400 font-mono">ĐIỂM SỐ CHUNG</div>
              <div className="text-2xl font-black text-rose-400 font-mono">{correctCount} / {totalQuestions} câu</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-neutral-400 font-mono">TỶ LỆ CHÍNH XÁC</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{scorePercent}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-neutral-400 font-mono">ĐÁNH GIÁ</div>
              <div className="text-sm sm:text-base font-bold text-white pt-1">
                {scorePercent >= 80 ? "Xuất sắc! Nắm rất chắc." : scorePercent >= 50 ? "Khá tốt. Hãy ôn lại câu sai." : "Cần cố gắng ôn tập thêm."}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-800">
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 rounded-2xl text-white transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Làm lại phần ôn tập này</span>
            </button>
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/15 rounded-2xl text-white border border-white/10 transition-all active:scale-98 cursor-pointer"
            >
              <span>Quay lại danh sách chính</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Sticky Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 py-4 shadow-2xl">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                Tiến trình: {answeredCount} / {totalQuestions} câu
              </span>
              <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded">
                {Math.round((answeredCount / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="w-32 sm:w-48 bg-neutral-200 dark:bg-neutral-850 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-rose-600 h-full rounded-full transition-all duration-350" 
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isGraded ? (
              <>
                {confirmGrade ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-xl border border-rose-200 dark:border-rose-900">
                    <span className="text-[10px] sm:text-xs text-rose-700 dark:text-rose-300 font-semibold px-2">
                      {unansweredCount > 0 ? `Cần làm thêm ${unansweredCount} câu. Nộp?` : "Xác nhận nộp bài?"}
                    </span>
                    <button
                      onClick={onGrade}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700 transition-all cursor-pointer shadow-sm shadow-rose-600/10"
                    >
                      Đồng ý
                    </button>
                    <button
                      onClick={() => setConfirmGrade(false)}
                      className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs rounded-lg transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmGrade(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs sm:text-sm rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <span>Chấm điểm</span>
                    <Award className="h-4.5 w-4.5" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline-block">
                  Đã chấm điểm: {correctCount}/{totalQuestions} Đúng
                </span>
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 font-semibold text-xs rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all"
                  title="Làm lại phần này"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Làm lại</span>
                </button>
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-rose-700 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <span>Quay lại</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
