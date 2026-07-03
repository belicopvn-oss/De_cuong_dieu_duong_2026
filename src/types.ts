export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string; // "A", "B", "C", "D"
  category?: string;
  explanation?: string;
}

export interface Part {
  id: number;
  name: string;
  startId: number;
  endId: number;
}

export interface QuizState {
  currentPartId: number;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  score: number;
  answers: { [questionId: number]: string }; // Tracks user answers in current session
  incorrectAnswers: number[]; // Tracks questions answered incorrectly in current session
}

export interface QuestionStat {
  questionId: number;
  wrongCount: number;
  totalAttempts: number;
  lastAttemptTime: string;
}

export interface StudyHistory {
  id: string;
  partId: number;
  partName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  durationSeconds: number;
}

export interface UserStats {
  completedParts: number[]; // Array of part IDs fully completed
  stats: { [questionId: number]: QuestionStat }; // Stats for each question
  history: StudyHistory[];
}
