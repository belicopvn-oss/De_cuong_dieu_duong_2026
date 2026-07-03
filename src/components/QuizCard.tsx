import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, X, AlertCircle, Award, Sparkles } from 'lucide-react';
import { Question } from '../types';

interface QuizCardProps {
  question: Question;
  currentIndex: number;
  totalInPart: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  onSelectOption: (optionLetter: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
  partName: string;
}

export default function QuizCard({
  question,
  currentIndex,
  totalInPart,
  selectedAnswer,
  isAnswered,
  onSelectOption,
  onNext,
  onPrevious,
  onFinish,
  partName,
}: QuizCardProps) {
  // Option letter helper (extracts 'A', 'B', 'C', 'D' from strings like 'A. Liên tục')
  const getOptionLetter = (optionStr: string) => {
    return optionStr.charAt(0);
  };

  const getOptionText = (optionStr: string) => {
    return optionStr.substring(2).trim();
  };

  // Check if a question is True/False or 4-option MCQs
  const isTrueFalse = question.options.length === 2 && 
    (question.options[0].includes('Đúng') || question.options[1].includes('Sai'));

  const progressPercent = Math.round(((currentIndex + 1) / totalInPart) * 100);

  return (
    <div id={`quiz-card-${question.id}`} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Session Progress Header */}
      <div className="bg-neutral-50 dark:bg-neutral-950/40 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            {partName}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Danh mục: <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{question.category || "Lý thuyết chung"}</strong>
          </span>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-semibold text-neutral-600 dark:text-neutral-400">
            Câu {currentIndex + 1} / {totalInPart}
          </span>
          <div className="w-20 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="p-6 sm:p-8 flex-grow space-y-6">
        
        {/* Question Text */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-xs font-mono font-bold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md h-fit shrink-0">
              # {question.id}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-relaxed pt-1">
            {question.question}
          </h2>
        </div>

        {/* Options Selection */}
        <div className={`grid gap-3 ${isTrueFalse ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {question.options.map((option, idx) => {
            const letter = getOptionLetter(option);
            const text = getOptionText(option);
            const isSelected = selectedAnswer === letter;
            const isCorrectAnswer = question.answer === letter;
            
            let btnClass = "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-850 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200";
            let letterClass = "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400";
            let iconElement = null;

            if (isAnswered) {
              if (isCorrectAnswer) {
                // Highlight correct option in green
                btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-medium";
                letterClass = "bg-emerald-500 text-white";
                iconElement = <Check className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />;
              } else if (isSelected) {
                // Selected but incorrect, highlight in red
                btnClass = "border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-300";
                letterClass = "bg-rose-500 text-white";
                iconElement = <X className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />;
              } else {
                // Dim other unselected non-correct options
                btnClass = "border-neutral-100 dark:border-neutral-850 opacity-40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed bg-transparent";
                letterClass = "bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-600";
              }
            } else if (isSelected) {
              btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100";
              letterClass = "bg-rose-500 text-white";
            }

            return (
              <button
                key={idx}
                id={`option-${idx}`}
                disabled={isAnswered}
                onClick={() => onSelectOption(letter)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all duration-200 shadow-sm ${
                  !isAnswered && 'active:scale-98 hover:scale-[1.01]'
                } ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-lg font-mono font-bold text-sm ${letterClass}`}>
                    {letter}
                  </span>
                  <span className="leading-snug">{text}</span>
                </div>
                {iconElement}
              </button>
            );
          })}
        </div>

        {/* Answer and Explanation Display */}
        {isAnswered && (
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            selectedAnswer === question.answer
              ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
              : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50'
          }`}>
            <div className="flex items-start gap-3">
              {selectedAnswer === question.answer ? (
                <div className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="h-5 w-5" />
                </div>
              ) : (
                <div className="p-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg shrink-0 mt-0.5">
                  <AlertCircle className="h-5 w-5" />
                </div>
              )}
              
              <div className="space-y-1 flex-grow">
                <h4 className={`text-sm font-semibold ${
                  selectedAnswer === question.answer ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'
                }`}>
                  {selectedAnswer === question.answer ? 'Chính xác! Đáp án đúng.' : `Chưa chính xác. Đáp án đúng là: ${question.answer}`}
                </h4>
                
                {/* Explanation text */}
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                  {question.explanation || "Đáp án được trích xuất trực tiếp từ Đề cương ôn thi điều dưỡng giỏi quốc gia năm 2026."}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Control Buttons Footer */}
      <div className="px-6 py-5 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        
        <button
          id="btn-prev-question"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Câu trước</span>
        </button>

        {currentIndex === totalInPart - 1 ? (
          <button
            id="btn-finish-quiz"
            onClick={onFinish}
            disabled={!isAnswered}
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm shadow-rose-500/20 active:scale-95"
          >
            <span>Hoàn thành phần học</span>
            <Award className="h-4 w-4" />
          </button>
        ) : (
          <button
            id="btn-next-question"
            onClick={onNext}
            disabled={!isAnswered}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm active:scale-95"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

      </div>

    </div>
  );
}
