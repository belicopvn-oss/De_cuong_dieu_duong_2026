import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Part } from '../types';

interface PartSelectorProps {
  parts: Part[];
  selectedPartId: number;
  onSelectPart: (id: number) => void;
  userProgress: { [partId: number]: number }; // Maps partId to number of answered questions
  stats: { [questionId: number]: { wrongCount: number; totalAttempts: number } };
}

const partMetadata: { [key: number]: { title: string; desc: string; iconBg: string } } = {
  1: {
    title: "Đề ôn tập - Phần 1",
    desc: "Câu 1 - 76: Quy tắc ứng xử viên chức y tế, chuẩn đạo đức nghề nghiệp, Luật khám chữa bệnh, kỹ năng giao tiếp và chăm sóc người bệnh cơ bản.",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  },
  2: {
    title: "Đề ôn tập - Phần 2",
    desc: "Câu 77 - 189: Cấp cứu phản vệ, tai biến truyền dịch, kỹ thuật thông tiểu, đặt ống thông dạ dày, hồi sức tim phổi CPR và quy trình điều dưỡng.",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
  },
  3: {
    title: "Đề ôn tập - Phần 3",
    desc: "Câu 190 - 272: Kiểm soát nhiễm khuẩn, phân loại chất thải y tế, phòng ngừa chuẩn, vệ sinh tay thường quy, tiệt khuẩn dụng cụ và vệ sinh môi trường.",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  },
  4: {
    title: "Đề ôn tập - Phần 4",
    desc: "Câu 273 - 420: Chăm sóc người bệnh Nội khoa và Cấp cứu: Tăng huyết áp, Đột quỵ, Đái tháo đường, Hen phế quản, suy tim, bệnh phổi tắc nghẽn mãn tính (COPD), v.v.",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
  },
  5: {
    title: "Đề ôn tập - Phần 5",
    desc: "Câu 421 - 560: Chăm sóc người bệnh Ngoại khoa, Sản khoa & Nhi khoa: Chấn thương sọ não, dẫn lưu lồng ngực, gãy xương, sỏi đường mật, suy hô hấp nhi, sốt cao co giật, theo dõi chuyển dạ, băng huyết sau sinh.",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
  },
  6: {
    title: "Đề ôn tập - Phần 6",
    desc: "Câu 561 - 700: Gây mê hồi sức ngoại khoa, Bảng kiểm an toàn phẫu thuật, Xét nghiệm hóa sinh & huyết học, Quy trình truyền máu an toàn.",
    iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400"
  },
  7: {
    title: "Đề ôn tập - Phần 7",
    desc: "Câu 701 - 800: Vi sinh vật học, Ký sinh trùng học, Kiểm soát nhiễm khuẩn chuyên sâu, xử lý phơi nhiễm nghề nghiệp y tế (HIV, HBV), giám sát nhiễm khuẩn vết mổ.",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  }
};

export default function PartSelector({
  parts,
  selectedPartId,
  onSelectPart,
  userProgress,
  stats,
}: PartSelectorProps) {
  const totalQuestionsCount = parts.length > 0 ? parts[parts.length - 1].endId : 0;

  return (
    <div id="part-selector" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-rose-500" />
          <span>Danh sách phần học ({totalQuestionsCount} Câu hỏi)</span>
        </h2>
        <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-md">
          {parts.length} phần ôn tập
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parts.map((part) => {
          const meta = partMetadata[part.id] || {
            title: `Phần ${part.id}`,
            desc: "Bộ đề cương trắc nghiệm lý thuyết ôn tập",
            iconBg: "bg-neutral-500/10 text-neutral-600"
          };

          const answeredCount = userProgress[part.id] || 0;
          const totalQuestions = part.endId - part.startId + 1;
          const progressPercent = Math.min(100, Math.round((answeredCount / totalQuestions) * 100));
          const isSelected = selectedPartId === part.id;
          const isCompleted = progressPercent === 100;

          // Calculate accuracy for this part based on active stats
          let correctAttempts = 0;
          let totalAttempts = 0;
          for (let i = part.startId; i <= part.endId; i++) {
            const qStat = stats[i];
            if (qStat) {
              totalAttempts += qStat.totalAttempts;
              correctAttempts += (qStat.totalAttempts - qStat.wrongCount);
            }
          }
          const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

          return (
            <div
              key={part.id}
              id={`part-card-${part.id}`}
              onClick={() => onSelectPart(part.id)}
              className={`group flex flex-col p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden h-full ${
                isSelected
                  ? 'border-rose-500 dark:border-rose-500/80 bg-rose-50/20 dark:bg-rose-950/10 ring-1 ring-rose-500/50 shadow-md'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
              }`}
            >
              {/* Highlight bar for active selection */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-2xl" />
              )}

              {/* Card Header Info */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${meta.iconBg}`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
                      Phần {part.id} • Câu {part.startId} - {part.endId}
                    </span>
                    <h3 className="font-display font-bold text-neutral-900 dark:text-white mt-0.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {meta.title}
                    </h3>
                  </div>
                </div>

                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 mb-4 leading-relaxed flex-grow">
                {meta.desc}
              </p>

              {/* Progress and accuracy footer */}
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-500 dark:text-neutral-500">Tiến độ</span>
                  <span className="text-neutral-900 dark:text-neutral-300 font-mono">
                    {answeredCount}/{totalQuestions} ({progressPercent}%)
                  </span>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Accuracy details */}
                {totalAttempts > 0 && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-dashed border-neutral-150 dark:border-neutral-800 mt-2">
                    <span className="text-neutral-400 dark:text-neutral-500">Tỉ lệ chính xác</span>
                    <span className={`font-mono font-semibold ${accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {accuracy}%
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 text-rose-500 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 hidden sm:block">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
