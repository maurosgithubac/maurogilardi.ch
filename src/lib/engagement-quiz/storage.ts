import {
  engagementQuizConfig,
  engagementQuizQuestions,
  type EngagementQuizQuestion,
} from "@/content/engagement-quiz";

const {
  answeredStorageKey,
  sessionStorageKey,
} = engagementQuizConfig;

type QuizSession = {
  popupShown: boolean;
  subpageViews: number;
  sessionStartedAt: number;
};

function readSession(): QuizSession {
  if (typeof window === "undefined") {
    return { popupShown: false, subpageViews: 0, sessionStartedAt: Date.now() };
  }
  try {
    const raw = sessionStorage.getItem(sessionStorageKey);
    if (!raw) {
      const initial: QuizSession = {
        popupShown: false,
        subpageViews: 0,
        sessionStartedAt: Date.now(),
      };
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as QuizSession;
  } catch {
    return { popupShown: false, subpageViews: 0, sessionStartedAt: Date.now() };
  }
}

function writeSession(session: QuizSession) {
  try {
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function getAnsweredQuestionIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(answeredStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function markQuestionAnswered(questionId: string) {
  const answered = new Set(getAnsweredQuestionIds());
  answered.add(questionId);
  try {
    localStorage.setItem(answeredStorageKey, JSON.stringify([...answered]));
  } catch {
    /* ignore */
  }
}

export function getNextQuizQuestion(): EngagementQuizQuestion | null {
  const answered = new Set(getAnsweredQuestionIds());
  return engagementQuizQuestions.find((q) => !answered.has(q.id)) ?? null;
}

export function registerSubpageView(pathname: string): QuizSession {
  const session = readSession();
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return session;
  }
  session.subpageViews += 1;
  writeSession(session);
  return session;
}

export function markQuizPopupShown() {
  const session = readSession();
  session.popupShown = true;
  writeSession(session);
}

export function getSessionElapsedSeconds(): number {
  const session = readSession();
  return Math.floor((Date.now() - session.sessionStartedAt) / 1000);
}

export function canShowQuizPopup(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;

  const session = readSession();
  if (session.popupShown) return false;
  if (!getNextQuizQuestion()) return false;
  if (session.subpageViews < engagementQuizConfig.minSubpageViews) return false;
  if (getSessionElapsedSeconds() < engagementQuizConfig.minTimeOnSiteSeconds) return false;

  return true;
}
