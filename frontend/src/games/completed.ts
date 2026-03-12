const COMPLETED_KEY = 'girls_completed_games';

export function readCompleted(): Set<string> {
  try {
    const stored = sessionStorage.getItem(COMPLETED_KEY);
    return new Set(stored ? (JSON.parse(stored) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function isGameCompleted(slug: string): boolean {
  return readCompleted().has(slug);
}

export function markGameCompleted(slug: string) {
  const completed = readCompleted();
  completed.add(slug);
  sessionStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed]));
}
