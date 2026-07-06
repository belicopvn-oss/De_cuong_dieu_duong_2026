import ThemeToggle from './ThemeToggle';
import { BookOpen, AlertCircle, History, Award } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  activeTab: 'study' | 'review' | 'history';
  setActiveTab: (tab: 'study' | 'review' | 'history') => void;
  wrongCount: number;
  historyCount: number;
  onLogoClick: () => void;
  totalQuestions?: number;
}

export default function Header({
  darkMode,
  onToggleTheme,
  activeTab,
  setActiveTab,
  wrongCount,
  historyCount,
  onLogoClick,
  totalQuestions = 800,
}: HeaderProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title and Logo */}
        <div
          id="header-logo-title"
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all group shrink-0"
          title="Về trang chủ"
        >
          <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl group-hover:bg-rose-500/20 group-hover:scale-105 transition-all">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Đề Cương Điều Dưỡng 2026
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
              Hệ thống ôn luyện {totalQuestions} câu hỏi trắc nghiệm
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
          
          {/* Main Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
            <button
              id="tab-study"
              onClick={() => setActiveTab('study')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'study'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Học tập</span>
            </button>

            <button
              id="tab-review"
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 relative ${
                activeTab === 'review'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Trọng tâm ôn tập</span>
              {wrongCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                  {wrongCount}
                </span>
              )}
            </button>

            <button
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Lịch sử</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-850 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Theme Toggler */}
          <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
        </div>

      </div>
    </header>
  );
}
