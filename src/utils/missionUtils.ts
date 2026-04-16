import { User, Interest } from '../store';

export function stringToSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    const j = (s >>> 0) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function computeGroups(
  users: User[],
  interests: Interest[],
  seedStr: string,
  avoidGroups?: number[][]
): number[][] {
  if (users.length === 0) return [];
  const sorted = [...users].sort((a, b) => a.id.localeCompare(b.id));
  // keyword가 없는 interest는 방어적으로 제외 (Firestore 데이터 누락 대비)
  const kwSets = sorted.map(u =>
    new Set(
      interests
        .filter(i => i.userId === u.id && i.keyword)
        .map(i => i.keyword.toLowerCase().trim())
    )
  );
  const pairSim = (i: number, j: number) => {
    let s = 0;
    kwSets[i].forEach(k => { if (kwSets[j].has(k)) s++; });
    return s;
  };
  const avoidSet = new Set<string>();
  if (avoidGroups) {
    avoidGroups.forEach(g => g.forEach(a => g.forEach(b => { if (a !== b) avoidSet.add(`${a}_${b}`); })));
  }
  const seed = stringToSeed(seedStr);
  const order = seededShuffle(sorted.map((_, i) => i), seed);
  const assigned = new Set<number>();
  const groups: number[][] = [];
  for (const anchor of order) {
    if (assigned.has(anchor)) continue;
    const group = [anchor];
    assigned.add(anchor);
    const remaining = order.filter(i => !assigned.has(i));
    const scored = remaining.map(i => {
      let score = 0;
      group.forEach(g => { score += pairSim(g, i); if (avoidSet.has(`${g}_${i}`)) score -= 50; });
      return { i, score };
    }).sort((a, b) => b.score - a.score || a.i - b.i);
    const targetExtra = ((seed ^ anchor) & 1) ? 3 : 2;
    for (let k = 0; k < Math.min(targetExtra, scored.length); k++) {
      group.push(scored[k].i);
      assigned.add(scored[k].i);
    }
    groups.push(group);
  }
  return groups;
}

/** index 배열(computeGroups 결과)을 userId 배열로 변환 */
export function groupIndicesToUserIds(groups: number[][], sortedUsers: User[]): string[][] {
  return groups.map(g => g.map(i => sortedUsers[i].id));
}
