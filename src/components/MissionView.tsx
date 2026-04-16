import { useState } from 'react';

interface MissionDetail {
  id: string;
  title: string;
  icon: string;
  badge: string;
  badgeColor: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

const MISSIONS: MissionDetail[] = [
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
        body: '1. LEADER LIBRARY 또는 PEOPLE MAP에서 관심 있는 리더를 찾아보세요.\n2. 티타임 요청 기능을 통해 런치 미팅을 제안하세요.\n3. 점심 자리에서 상대방의 Giver 키워드에 관한 질문을 최소 2개 이상 나눠보세요.\n4. 대화를 통해 얻은 인사이트를 MY INSIGHT에 기록해보세요.',
      },
      {
        heading: '미션 포인트',
        body: '서로 다른 계열사 리더와의 대화에서 예상치 못한 협업 아이디어를 발견할 수 있습니다. 열린 마음으로 상대방의 이야기에 귀 기울여 보세요.',
      },
    ],
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
        body: '과정 기간 중 최소 3명의 리더에게 티타임을 먼저 제안하고, 자신의 Giver 키워드를 바탕으로 실질적인 도움을 나눠보세요.',
      },
      {
        heading: '미션 방법',
        body: '1. MY NETWORK에서 나의 Giver 키워드와 상대방의 Taker 키워드가 매칭되는 리더를 찾아보세요.\n2. LIBRARY에서 해당 리더에게 티타임 요청을 보내세요.\n3. 티타임에서 자신의 경험과 노하우를 진정성 있게 나눠보세요.\n4. 대화 후 MY INSIGHT에 배운 점을 기록해보세요.',
      },
      {
        heading: '미션 포인트',
        body: '주는 것(Giver)이 곧 받는 것(Taker)이 됩니다. 내가 먼저 가치를 제공함으로써 신뢰 기반의 네트워크가 형성됩니다. 과정이 끝난 후에도 이어지는 관계를 만들어보세요.',
      },
    ],
  },
];

export default function MissionView() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

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
          return (
            <div
              key={mission.id}
              className={`bg-surface rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${
                isOpen ? 'border-primary/40 shadow-md' : 'border-outline hover:border-primary/25'
              }`}
            >
              {/* 카드 헤더 (클릭) */}
              <button
                onClick={() => toggle(mission.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isOpen ? 'bg-primary text-on-primary' : 'bg-primary/8 text-primary'
                }`}>
                  <span className="material-symbols-outlined text-xl">{mission.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${mission.badgeColor}`}>
                      {mission.badge}
                    </span>
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
