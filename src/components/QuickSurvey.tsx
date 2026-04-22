import { useState } from 'react';
import { useStore } from '../store';

interface QuickSurveyProps {
  onComplete: () => void;
}

export default function QuickSurvey({ onComplete }: QuickSurveyProps) {
  const { currentUser, updateUser } = useStore();
  const [golfScore, setGolfScore] = useState('');
  const [careerYears, setCareerYears] = useState('');
  const [knownPeople, setKnownPeople] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ golf?: string; career?: string; known?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    const golfNum = Number(golfScore.trim());
    const careerNum = Number(careerYears.trim());
    const knownNum = Number(knownPeople.trim());

    if (!golfScore.trim()) {
      next.golf = '타수를 입력해주세요.';
    } else if (isNaN(golfNum) || golfNum < 18 || golfNum > 300) {
      next.golf = '18~300 사이의 숫자를 입력해주세요.';
    }

    if (!careerYears.trim()) {
      next.career = '경력 연수를 입력해주세요.';
    } else if (isNaN(careerNum) || careerNum < 0 || careerNum > 60) {
      next.career = '0~60 사이의 숫자를 입력해주세요.';
    }

    if (!knownPeople.trim()) {
      next.known = '인원 수를 입력해주세요.';
    } else if (isNaN(knownNum) || knownNum < 0 || knownNum > 500) {
      next.known = '0~500 사이의 숫자를 입력해주세요.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !currentUser) return;
    setIsSubmitting(true);
    try {
      await updateUser({
        ...currentUser,
        golfScore: Number(golfScore.trim()),
        careerYears: Number(careerYears.trim()),
        knownPeople: Number(knownPeople.trim()),
      });
    } catch {
      // 저장 실패해도 진행
    } finally {
      setIsSubmitting(false);
      onComplete();
    }
  };

  const handleSkip = () => onComplete();

  const inputClass = (hasError: boolean) =>
    `flex items-center gap-3 bg-surface-container-low border rounded-2xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary ${
      hasError ? 'border-error ring-2 ring-error/20' : 'border-outline'
    }`;

  return (
    <div className="absolute inset-0 flex flex-col bg-background text-on-surface">
      <header className="header-safe shrink-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline shadow-sm">
        <div className="h-14 flex items-center px-6">
          <span className="font-headline text-xl font-bold tracking-tight text-primary">Quick Survey</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* 아이콘 + 제목 */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-3xl text-primary">quiz</span>
            </div>
            <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight">
              잠깐, 몇 가지만 여쭤볼게요!
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              네트워킹에 도움이 되는 간단한 질문입니다.
            </p>
          </div>

          {/* Q1: 골프 타수 */}
          <div className="bg-surface border border-outline rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-black">Q1</span>
              <p className="text-base font-bold text-on-surface leading-snug pt-0.5">
                골프, 보통 몇 타 정도 치세요?
              </p>
            </div>
            <div className="space-y-2">
              <div className={inputClass(!!errors.golf)}>
                <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0">sports_golf</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={golfScore}
                  onChange={e => { setGolfScore(e.target.value); setErrors(prev => ({ ...prev, golf: undefined })); }}
                  placeholder="예) 90"
                  min={18}
                  max={300}
                  className="flex-1 bg-transparent border-none p-0 text-base outline-none text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                />
                <span className="text-sm text-on-surface-variant font-medium shrink-0">타</span>
              </div>
              {errors.golf && (
                <p className="text-xs text-error font-medium flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {errors.golf}
                </p>
              )}
              <p className="text-xs text-on-surface-variant/60 px-1">모르시면 평균 스코어나 핸디캡 기준으로 입력해주세요.</p>
            </div>
          </div>

          {/* Q2: 현대차그룹 경력 */}
          <div className="bg-surface border border-outline rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-black">Q2</span>
              <p className="text-base font-bold text-on-surface leading-snug pt-0.5">
                현대차그룹에서 경력은 총 몇 년이신가요?
              </p>
            </div>
            <div className="space-y-2">
              <div className={inputClass(!!errors.career)}>
                <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0">work_history</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={careerYears}
                  onChange={e => { setCareerYears(e.target.value); setErrors(prev => ({ ...prev, career: undefined })); }}
                  placeholder="예) 10"
                  min={0}
                  max={60}
                  className="flex-1 bg-transparent border-none p-0 text-base outline-none text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                />
                <span className="text-sm text-on-surface-variant font-medium shrink-0">년</span>
              </div>
              {errors.career && (
                <p className="text-xs text-error font-medium flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {errors.career}
                </p>
              )}
              <p className="text-xs text-on-surface-variant/60 px-1">계열사 포함 총 재직 기간을 입력해주세요.</p>
            </div>
          </div>

          {/* Q3: 강의장 아는 분 */}
          <div className="bg-surface border border-outline rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-black">Q3</span>
              <p className="text-base font-bold text-on-surface leading-snug pt-0.5">
                오늘 강의장에 아시는 분은 몇 분인가요?
              </p>
            </div>
            <div className="space-y-2">
              <div className={inputClass(!!errors.known)}>
                <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0">group</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={knownPeople}
                  onChange={e => { setKnownPeople(e.target.value); setErrors(prev => ({ ...prev, known: undefined })); }}
                  placeholder="예) 3"
                  min={0}
                  max={500}
                  className="flex-1 bg-transparent border-none p-0 text-base outline-none text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                />
                <span className="text-sm text-on-surface-variant font-medium shrink-0">분</span>
              </div>
              {errors.known && (
                <p className="text-xs text-error font-medium flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {errors.known}
                </p>
              )}
              <p className="text-xs text-on-surface-variant/60 px-1">오늘 처음 만나신 분도 포함해서 아는 분이면 모두 세어주세요.</p>
            </div>
          </div>

          {/* 진행 표시 */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-6 h-1.5 rounded-full bg-primary"></div>
            <div className="w-6 h-1.5 rounded-full bg-primary"></div>
            <div className="w-6 h-1.5 rounded-full bg-primary"></div>
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
