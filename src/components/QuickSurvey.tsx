import { useState } from 'react';
import { useStore } from '../store';

interface QuickSurveyProps {
  onComplete: () => void;
}

export default function QuickSurvey({ onComplete }: QuickSurveyProps) {
  const { currentUser, updateUser } = useStore();
  const [golfScore, setGolfScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');

  const handleSubmit = async () => {
    const score = golfScore.trim();
    if (!score) {
      setInputError('타수를 입력해주세요.');
      return;
    }
    const num = Number(score);
    if (isNaN(num) || num < 18 || num > 300) {
      setInputError('18~300 사이의 숫자를 입력해주세요.');
      return;
    }
    if (!currentUser) return;
    setInputError('');
    setIsSubmitting(true);
    try {
      await updateUser({ ...currentUser, golfScore: num });
    } catch {
      // 저장 실패해도 진행
    } finally {
      setIsSubmitting(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background text-on-surface">
      <header className="header-safe shrink-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline shadow-sm">
        <div className="h-14 flex items-center px-6">
          <span className="font-headline text-xl font-bold tracking-tight text-primary">Quick Survey</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* 아이콘 + 제목 */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-3xl text-primary">sports_golf</span>
            </div>
            <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight">
              잠깐, 한 가지만 여쭤볼게요!
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              네트워킹에 도움이 되는 간단한 질문입니다.
            </p>
          </div>

          {/* 질문 카드 */}
          <div className="bg-surface border border-outline rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-black">Q1</span>
              <p className="text-base font-bold text-on-surface leading-snug pt-0.5">
                골프, 보통 몇 타 정도 치세요?
              </p>
            </div>

            <div className="space-y-2">
              <div className={`flex items-center gap-3 bg-surface-container-low border rounded-2xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary ${
                inputError ? 'border-error ring-2 ring-error/20' : 'border-outline'
              }`}>
                <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0">golf_course</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={golfScore}
                  onChange={e => { setGolfScore(e.target.value); setInputError(''); }}
                  placeholder="예) 90"
                  min={18}
                  max={300}
                  className="flex-1 bg-transparent border-none p-0 text-base outline-none text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                />
                <span className="text-sm text-on-surface-variant font-medium shrink-0">타</span>
              </div>
              {inputError && (
                <p className="text-xs text-error font-medium flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {inputError}
                </p>
              )}
              <p className="text-xs text-on-surface-variant/60 px-1">
                모르시면 평균 스코어나 핸디캡 기준으로 입력해주세요.
              </p>
            </div>
          </div>

          {/* 진행 표시 */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-6 h-1.5 rounded-full bg-primary"></div>
            <div className="w-2 h-1.5 rounded-full bg-outline"></div>
          </div>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div
        className="shrink-0 px-6 pt-3 bg-white/90 backdrop-blur-md border-t border-outline shadow-lg space-y-2"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-md mx-auto w-full space-y-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 bg-primary text-white font-headline font-bold rounded-2xl shadow-xl active:scale-95 hover:opacity-90 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                저장 중...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">check_circle</span>
                제출하고 입장하기
              </>
            )}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}
