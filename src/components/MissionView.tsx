import { useState, useMemo, Key } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, User, Interest, TeaTimeRequest } from '../store';
import { computeGroups } from '../utils/missionUtils';

// ─── 공통 관심사 & 대화 주제 ──────────────────────────────────────────────────

function getSharedKeywords(group: User[], allInterests: Interest[]): string[] {
  const kwCount: Record<string, number> = {};
  group.forEach(u => {
    allInterests.filter(i => i.userId === u.id).forEach(i => {
      const k = i.keyword.toLowerCase().trim();
      kwCount[k] = (kwCount[k] || 0) + 1;
    });
  });
  return Object.entries(kwCount)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
}

function generateTopics(group: User[], allInterests: Interest[], me: User): string[] {
  const topics: string[] = [];
  const partners = group.filter(u => u.id !== me.id);
  const myI = allInterests.filter(i => i.userId === me.id);
  for (const p of partners) {
    const pI = allInterests.filter(i => i.userId === p.id);
    for (const m of myI) {
      for (const pi of pI) {
        if (m.keyword.toLowerCase() === pi.keyword.toLowerCase()) {
          if (m.type === 'giver' && pi.type === 'taker')
            topics.push(`${me.name}님의 #${m.keyword} 경험을 ${p.name}님과 나눠보세요`);
          else if (m.type === 'taker' && pi.type === 'giver')
            topics.push(`${p.name}님의 #${pi.keyword} 노하우를 여쭤보세요`);
        }
      }
    }
  }
  const shared = getSharedKeywords(group, allInterests);
  shared.slice(0, 2).forEach(kw => topics.push(`공통 관심사 #${kw}에 대한 각자의 인사이트를 나눠보세요`));
  if (topics.length < 2) {
    topics.push('각자의 현업에서 가장 도전적인 순간과 극복 경험을 나눠보세요');
    topics.push('이번 과정에서 현업에 적용하고 싶은 아이디어를 서로 공유해보세요');
  }
  return [...new Set(topics)].slice(0, 4);
}

// ─── 파트너 카드 컴포넌트 ─────────────────────────────────────────────────────

const isUrl = (s?: string) =>
  !!s && (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/'));

function PartnerCard({
  partner,
  allInterests,
  currentUser,
  index,
}: {
  key?: Key;
  partner: User;
  allInterests: Interest[];
  currentUser: User;
  index: number;
}) {
  const myKws = new Set(
    allInterests.filter(i => i.userId === currentUser.id).map(i => i.keyword.toLowerCase().trim())
  );
  const partnerKws = allInterests.filter(i => i.userId === partner.id).map(i => i.keyword.toLowerCase().trim());
  const sharedWith = partnerKws.filter(k => myKws.has(k));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="bg-surface rounded-xl border border-outline/40 p-4 flex gap-3 items-start"
    >
      <div className="shrink-0">
        {isUrl(partner.profilePic) ? (
          <img
            src={partner.profilePic}
            alt={partner.name}
            className="w-12 h-12 rounded-full object-cover border border-outline/30"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-primary font-black text-lg">{partner.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-on-surface">{partner.name}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">
          {partner.company}{partner.department ? ` · ${partner.department}` : ''}
        </p>
        {partner.title && (
          <p className="text-[11px] text-on-surface-variant/70">{partner.title}</p>
        )}
        {sharedWith.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sharedWith.map(kw => (
              <span key={kw} className="bg-primary/10 text-primary text-[10px] font-bold rounded-md px-2 py-0.5">
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── 파트너 매칭 섹션 ─────────────────────────────────────────────────────────

function PartnerMatchSection({
  missionLabel,
  partners,
  group,
  allInterests,
  currentUser,
  revealed,
  loading,
  onReveal,
  isConfirmed,
}: {
  missionLabel: string;
  partners: User[];
  group: User[];
  allInterests: Interest[];
  currentUser: User;
  revealed: boolean;
  loading: boolean;
  onReveal: () => void;
  isConfirmed: boolean;
}) {
  const [pendingAlert, setPendingAlert] = useState(false);

  const topics = useMemo(
    () => generateTopics(group, allInterests, currentUser),
    [group, allInterests, currentUser]
  );
  const sharedKws = useMemo(
    () => getSharedKeywords(group, allInterests),
    [group, allInterests]
  );

  return (
    <div className="mt-5">
      <div className="h-px bg-outline/30 mb-5" />
      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">파트너 매칭</p>

      {!revealed && !loading && (
        <div className="space-y-3">
          <button
            onClick={() => isConfirmed ? onReveal() : setPendingAlert(true)}
            className={`w-full font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
              isConfirmed
                ? 'bg-gradient-to-r from-primary to-primary/70 text-white hover:opacity-90 active:scale-95'
                : 'bg-surface-container border border-outline/60 text-on-surface-variant/60 cursor-default'
            }`}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            파트너 확인하기
          </button>

          {pendingAlert && !isConfirmed && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-amber-500 text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                담당자가 파트너 매칭중입니다. 잠시만 기다려주세요.
              </p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="w-full bg-gradient-to-r from-primary to-primary/70 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>매칭 중...</span>
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-black text-on-surface">나의 {missionLabel} 파트너</p>
              <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                {partners.length}명
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {partners.map((p, idx) => (
                <PartnerCard key={p.id} partner={p} allInterests={allInterests} currentUser={currentUser} index={idx} />
              ))}
            </div>
            {sharedKws.length > 0 && (
              <div className="bg-surface-container-low rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">그룹 공통 관심사</p>
                <div className="flex flex-wrap gap-1.5">
                  {sharedKws.map(kw => (
                    <span key={kw} className="bg-primary/10 text-primary text-[10px] font-bold rounded-md px-2 py-0.5">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-surface-container-low rounded-xl px-4 py-3 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">추천 대화 주제</p>
              {topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary text-sm mt-0.5">💬</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{topic}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 티타임 미션 섹션 ─────────────────────────────────────────────────────────

function TeaTimeMissionSection({
  currentUser,
  teaTimeRequests,
  onNavigateToLibrary,
}: {
  currentUser: User;
  teaTimeRequests: TeaTimeRequest[];
  onNavigateToLibrary?: () => void;
}) {
  const { db, fetchData } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await fetchData(); } finally { setIsRefreshing(false); }
  };

  // 내가 보낸 요청 목록 (최신순)
  const sentRequests = useMemo(
    () => teaTimeRequests
      .filter(r => r.fromUserId === currentUser.id)
      .sort((a, b) => b.id.localeCompare(a.id)),
    [teaTimeRequests, currentUser.id]
  );

  // 중복 제거 후 신청 건수 (toUserId 기준 unique)
  const sentCount = useMemo(
    () => new Set(sentRequests.map(r => r.toUserId)).size,
    [sentRequests]
  );
  const acceptedCount = useMemo(
    () => sentRequests.filter(r => r.status === 'accepted').length,
    [sentRequests]
  );
  const missionComplete = sentCount >= 2;

  return (
    <div className="mt-5 space-y-5">
      <div className="h-px bg-outline/30" />

      {/* 새로고침 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant border border-outline/60 rounded-lg px-3 py-1.5 hover:bg-surface-container-low transition-all ${isRefreshing ? 'opacity-60' : ''}`}
        >
          <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
          {isRefreshing ? '업데이트 중...' : '최신 데이터로 업데이트'}
        </button>
      </div>

      {/* 안내 문구 */}
      <div className="bg-secondary/8 border border-secondary/25 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-secondary text-base mt-0.5 shrink-0">tips_and_updates</span>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          과정 진행 중에 최소 <span className="font-black text-on-surface">2명 이상</span>의 리더에게 티타임을 먼저 제안해보세요.
        </p>
      </div>

      {/* 미션 진행 현황 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">미션 진행 현황</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              신청 {sentCount}건
            </span>
            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-300 px-2 py-0.5 rounded-md">
              수락 {acceptedCount}건
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${missionComplete ? 'bg-green-500/15 text-green-600' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {sentCount} / 2
            </span>
          </div>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${missionComplete ? 'bg-green-500' : 'bg-secondary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(sentCount / 2 * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Mission Complete 배지 */}
      <AnimatePresence>
        {missionComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="rounded-xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}
          >
            <div className="px-4 py-3.5 flex items-center gap-3">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <div className="flex-1">
                <p className="font-black text-sm text-white uppercase tracking-wide">Mission Complete!</p>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {sentCount}명에게 신청 · {acceptedCount}명 수락 — 멋진 연결을 만들고 있어요! 🎉
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 미션 진행 중 응원 문구 */}
      {!missionComplete && (
        <div className="flex items-center gap-2.5 bg-secondary/6 border border-secondary/20 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-secondary text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <p className="text-xs text-secondary font-medium leading-relaxed">관심있는 리더에게 티타임을 제안해보세요.</p>
        </div>
      )}

      {/* 내가 보낸 티타임 요청 목록 */}
      {sentRequests.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            내가 제안한 티타임 ({sentCount}명)
          </p>
          {sentRequests.map((req, idx) => {
            const toUser = db.users.find((u: User) => u.id === req.toUserId);
            if (!toUser) return null;
            const statusLabel =
              req.status === 'accepted' ? { text: '수락됨 ✓', cls: 'bg-green-50 text-green-700 border-green-200' } :
              req.status === 'rejected' ? { text: '거절됨', cls: 'bg-surface-container text-on-surface-variant border-outline/40' } :
              { text: '대기 중', cls: 'bg-blue-50 text-blue-600 border-blue-200' };
            const displayMsg = req.message.includes('\n\n') ? req.message.split('\n\n')[1] : req.message;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.3 }}
                className="bg-surface rounded-xl border border-outline/40 p-4 space-y-3"
              >
                {/* 유저 정보 */}
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low overflow-hidden flex items-center justify-center shrink-0 border border-outline">
                    {isUrl(toUser.profilePic)
                      ? <img src={toUser.profilePic} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : <span className="font-bold text-secondary text-xs">{toUser.name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-on-surface truncate">{toUser.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">
                          {toUser.company}{toUser.department ? ` · ${toUser.department}` : ''}
                        </p>
                        {toUser.title && (
                          <p className="text-[10px] text-on-surface-variant/70 truncate">{toUser.title}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${statusLabel.cls}`}>
                        {statusLabel.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 내 요청 메시지 */}
                <div className="bg-primary/6 border border-primary/20 rounded-xl px-3 py-2.5">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">내 제안</p>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">{displayMsg}</p>
                </div>

                {/* 상대방 응답 */}
                {req.responseMessage && (
                  <div className={`rounded-xl px-3 py-2.5 border ${req.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-surface-container border-outline/40'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${req.status === 'accepted' ? 'text-green-700' : 'text-on-surface-variant'}`}>
                      {toUser.name}님의 응답
                    </p>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">{req.responseMessage}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 티타임 요청하기 버튼 */}
      <button
        onClick={onNavigateToLibrary}
        className="w-full py-4 bg-secondary text-on-secondary font-black rounded-2xl shadow-md hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-sm"
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        티타임 요청하기
        <span className="material-symbols-outlined text-base opacity-70">arrow_forward</span>
      </button>
    </div>
  );
}

// ─── 미션 카드 (아코디언) ─────────────────────────────────────────────────────

interface MissionConfig {
  id: string;
  title: string;
  icon: string;
  badge: string;
  badgeColor: string;
  summary: string;
  sections: { heading: string; body: string }[];
  hasPartnerMatch: boolean;
  hasTeaTimeMatch: boolean;
}

const MISSIONS: MissionConfig[] = [
  {
    id: 'lunch',
    title: '런치타임 미션',
    icon: 'restaurant',
    badge: 'LUNCH MISSION',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    summary: '점심 식사 시간을 활용해 새로운 리더와 연결되는 미션입니다.',
    sections: [
      {
        heading: '미션 목표',
        body: '이번 과정에서 아직 대화를 나누지 않은 리더와 점심을 함께하며 서로의 Giver/Taker 관심사를 공유하세요.',
      },
      {
        heading: '미션 방법',
        body: '1. 매칭된 파트너를 확인하고 미리 LEADER LIBRARY에서 프로필을 살펴보세요.\n2. 점심 자리에서 상대방의 Giver 키워드에 관한 질문을 최소 2개 이상 나눠보세요.',
      },
      {
        heading: '미션 포인트',
        body: '서로 다른 계열사 리더와의 대화에서 예상치 못한 협업 아이디어를 발견할 수 있습니다. 열린 마음으로 귀 기울여보세요.',
      },
    ],
    hasPartnerMatch: true,
    hasTeaTimeMatch: false,
  },
  {
    id: 'teatime',
    title: '티타임 제안 미션',
    icon: 'coffee',
    badge: 'TEA TIME MISSION',
    badgeColor: 'bg-secondary/10 text-secondary border-secondary/20',
    summary: 'be Giver 정신으로 내가 먼저 티타임을 제안하는 미션입니다.',
    sections: [
      {
        heading: '미션 목표',
        body: '과정 진행 중에 최소 2명 이상의 리더에게 티타임을 먼저 제안하여, 본 과정에서 만들어진 리더간의 느슨한 연결이 좀 더 지속적인 연결로 이어질 수 있도록 실천하는 것.',
      },
      {
        heading: '미션 방법',
        body: '1. 아래 추천 리더 목록에서 나와 키워드 또는 근무지가 매칭되는 리더를 확인하세요.\n2. 티타임 요청 버튼을 눌러 리더에게 티타임을 제안하세요.\n3. 티타임 일정을 구체적으로 조율하고, 여유가 되신다면 식사도 함께하세요.',
      },
      {
        heading: '미션 포인트',
        body: '교육장에서의 만남과 실제 현업에서의 만남은 또 다른 의미와 경험이 될 것 입니다. 서로의 제안을 소중히 여기시고, 실제 일정에 등록함으로써 소중한 만남을 가져주시면 감사하겠습니다.',
      },
    ],
    hasPartnerMatch: false,
    hasTeaTimeMatch: true,
  },
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function MissionView({ onNavigateToLibrary }: { onNavigateToLibrary?: () => void }) {
  const { db, currentUser } = useStore();

  const [openId, setOpenId] = useState<string | null>(null);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id));

  const handleReveal = (missionId: string) => {
    setLoadingMap(prev => ({ ...prev, [missionId]: true }));
    setTimeout(() => {
      setLoadingMap(prev => ({ ...prev, [missionId]: false }));
      setRevealedMap(prev => ({ ...prev, [missionId]: true }));
    }, 1500);
  };

  // 확정된 DB 그룹 조회
  const confirmedLunchGroup = useMemo(() => {
    if (!currentUser) return null;
    return db.missionGroups.find(g => g.courseId === currentUser.courseId && g.type === 'lunch') ?? null;
  }, [db.missionGroups, currentUser]);

  // 확정된 그룹에서 내 파트너 찾기
  const getMyConfirmedGroup = (confirmedGroups: string[][]): User[] => {
    if (!currentUser) return [];
    const myGroup = confirmedGroups.find(g => g.includes(currentUser.id));
    if (!myGroup) return [];
    return myGroup.map(uid => db.users.find(u => u.id === uid)).filter(Boolean) as User[];
  };

  const lunchGroup = useMemo(
    () => confirmedLunchGroup ? getMyConfirmedGroup(confirmedLunchGroup.groups) : [],
    [confirmedLunchGroup, db.users, currentUser]
  );
  const lunchPartners = lunchGroup.filter(u => u.id !== currentUser?.id);

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div className="pb-3 border-b-2 border-primary/30">
        <h1 className="font-headline text-2xl font-black uppercase tracking-widest text-primary">MISSION</h1>
        <p className="text-xs text-on-surface-variant mt-0.5 font-medium">과정 중 도전해볼 네트워킹 미션</p>
      </div>

      {/* 미션 카드 목록 */}
      <div className="space-y-4">
        {MISSIONS.map(mission => {
          const isOpen = openId === mission.id;
          const revealed = revealedMap[mission.id] ?? false;
          const loading = loadingMap[mission.id] ?? false;

          const isLunch = mission.id === 'lunch';
          const partners = isLunch ? lunchPartners : [];
          const group = isLunch ? lunchGroup : [];
          const isConfirmed = isLunch ? !!confirmedLunchGroup : false;

          // 티타임 미션 완료 여부 (카드 헤더 배지용)
          const isTeatime = mission.id === 'teatime';
          const teatimeSentCount = isTeatime
            ? new Set(db.teaTimeRequests.filter(r => r.fromUserId === currentUser.id).map(r => r.toUserId)).size
            : 0;
          const teatimeComplete = isTeatime && teatimeSentCount >= 2;

          return (
            <div
              key={mission.id}
              className={`bg-surface rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${
                isOpen ? 'border-primary/40 shadow-md' : 'border-outline hover:border-primary/25'
              }`}
            >
              {/* 카드 헤더 */}
              <button
                onClick={() => toggle(mission.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-primary text-on-primary' : 'bg-primary/8 text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{mission.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${mission.badgeColor}`}>
                      {mission.badge}
                    </span>
                    {teatimeComplete && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-green-500/10 text-green-600 border-green-500/30">
                        ✓ COMPLETE
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-on-surface mt-0.5">{mission.title}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-1">{mission.summary}</p>
                </div>
                <span
                  className={`material-symbols-outlined text-on-surface-variant text-xl shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>

              {/* 상세 내용 */}
              {isOpen && (
                <div className="px-5 pb-6 space-y-5 border-t border-outline/40 pt-4">
                  {mission.sections.map(sec => (
                    <div key={sec.heading} className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">{sec.heading}</p>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        {sec.body.split('\n').map((line, i) => (
                          <p key={i} className={`text-xs text-on-surface-variant leading-relaxed ${i > 0 ? 'mt-1' : ''}`}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* 파트너 매칭 (런치) */}
                  {mission.hasPartnerMatch && (
                    <PartnerMatchSection
                      missionLabel={mission.title}
                      partners={partners}
                      group={group}
                      allInterests={db.interests}
                      currentUser={currentUser}
                      revealed={revealed}
                      loading={loading}
                      onReveal={() => handleReveal(mission.id)}
                      isConfirmed={isConfirmed}
                    />
                  )}

                  {/* 티타임 미션 */}
                  {mission.hasTeaTimeMatch && (
                    <TeaTimeMissionSection
                      currentUser={currentUser}
                      teaTimeRequests={db.teaTimeRequests}
                      onNavigateToLibrary={onNavigateToLibrary}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
