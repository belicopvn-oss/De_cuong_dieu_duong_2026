import { useState } from 'react';
import { History, Award, Calendar, Clock, BarChart2, Trash2 } from 'lucide-react';
import { StudyHistory } from '../types';

interface HistoryPanelProps {
  history: StudyHistory[];
  onClearHistory: () => void;
}

export default function HistoryPanel({ history, onClearHistory }: HistoryPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs} giây`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <div id="history-empty" className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/10 max-w-2xl mx-auto space-y-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <History className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
            Chưa có lịch sử làm bài
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            Khi bạn ôn tập hoàn thành 100 câu hỏi ở bất kỳ phần nào và bấm "Hoàn thành phần học", kết quả và thống kê chi tiết của phiên làm bài sẽ được lưu lại tại đây.
          </p>
        </div>
      </div>
    );
  }

  // Calculate aggregates
  const totalSessions = history.length;
  const avgScorePercent = Math.round(
    (history.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / totalSessions) * 100
  );
  const totalTimeSeconds = history.reduce((acc, curr) => acc + curr.durationSeconds, 0);

  return (
    <div id="history-dashboard" className="space-y-6">
      
      {/* Dashboard aggregate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-neutral-400">Phiên làm bài</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">{totalSessions}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-neutral-400">Độ chính xác TB</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">{avgScorePercent}%</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-neutral-400">Tổng thời gian học</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
              {Math.floor(totalTimeSeconds / 60)} phút
            </p>
          </div>
        </div>

      </div>

      {/* History timeline list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-neutral-900 dark:text-white">
            Nhật ký phiên học tập
          </h3>
          {confirmClear ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Xác nhận xóa?</span>
              <button
                id="btn-clear-history-confirm"
                onClick={() => {
                  onClearHistory();
                  setConfirmClear(false);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                Có, xóa
              </button>
              <button
                id="btn-clear-history-cancel"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              id="btn-clear-history"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 border border-neutral-200 dark:border-neutral-800 hover:border-rose-200 bg-white dark:bg-neutral-900 hover:bg-rose-50/20 transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa lịch sử</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {history.map((item) => {
            const accuracy = Math.round((item.score / item.totalQuestions) * 100);
            
            // Custom mastery badges
            let badgeClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
            let badgeText = "Cần cố gắng";
            if (accuracy >= 90) {
              badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
              badgeText = "Xuất sắc";
            } else if (accuracy >= 70) {
              badgeClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50";
              badgeText = "Đạt yêu cầu";
            }

            return (
              <div
                key={item.id}
                id={`history-row-${item.id}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs"
              >
                
                {/* Session Part details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {item.partName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(item.completedAt)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Làm trong {formatDuration(item.durationSeconds)}</span>
                    </span>
                  </div>
                </div>

                {/* Score block */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      Đạt {item.score} / {item.totalQuestions} câu
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      Độ chính xác
                    </p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                    accuracy >= 90 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
                    accuracy >= 70 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' :
                    'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    {accuracy}%
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
