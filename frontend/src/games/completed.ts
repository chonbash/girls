const COMPLETED_KEY = 'girls_completed_games';

export function readCompleted(): Set<string> {
  try {
    const s = sessionStorage.getItem(COMPLETED_KEY);
    return new Set(s ? (JSON.parse(s) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markGameCompleted(slug: string) {
  const set = readCompleted();
  set.add(slug);
  sessionStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

