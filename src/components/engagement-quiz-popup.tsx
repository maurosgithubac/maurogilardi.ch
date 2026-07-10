"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  engagementQuizConfig,
  type EngagementQuizOption,
  type EngagementQuizQuestion,
} from "@/content/engagement-quiz";
import {
  canShowQuizPopup,
  getNextQuizQuestion,
  getSessionElapsedSeconds,
  markQuestionAnswered,
  markQuizPopupShown,
  registerSubpageView,
} from "@/lib/engagement-quiz/storage";

export function EngagementQuizPopup() {
  const pathname = usePathname();
  const titleId = useId();
  const feedbackId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState<EngagementQuizQuestion | null>(null);
  const [selected, setSelected] = useState<EngagementQuizOption | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const tryOpen = useCallback(() => {
    if (open || pathname.startsWith("/admin")) return;
    if (!canShowQuizPopup(pathname)) return;

    const next = getNextQuizQuestion();
    if (!next) return;

    markQuizPopupShown();
    setQuestion(next);
    setSelected(null);
    setOpen(true);
  }, [open, pathname]);

  const closeWithoutAnswer = useCallback(() => {
    setOpen(false);
    setSelected(null);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    registerSubpageView(pathname);
    setElapsed(getSessionElapsedSeconds());
    tryOpen();
  }, [pathname, tryOpen]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const tick = window.setInterval(() => {
      setElapsed(getSessionElapsedSeconds());
    }, 1000);

    return () => window.clearInterval(tick);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (elapsed < engagementQuizConfig.minTimeOnSiteSeconds) return;
    tryOpen();
  }, [elapsed, pathname, tryOpen]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWithoutAnswer();
    };

    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeWithoutAnswer]);

  function handleSelect(option: EngagementQuizOption) {
    if (!question || selected) return;
    setSelected(option);
    markQuestionAnswered(question.id);
  }

  function handleContinue() {
    setOpen(false);
    setQuestion(null);
    setSelected(null);
  }

  function handleFooterNavigate() {
    setOpen(false);
    setQuestion(null);
    setSelected(null);
  }

  if (!open || !question || pathname.startsWith("/admin")) return null;

  const correctOption = question.options.find((option) => option.isCorrect);

  return (
    <div className="engagement-quiz-root" aria-hidden={false}>
      <button
        type="button"
        className="engagement-quiz-backdrop"
        aria-label="Quiz schliessen"
        onClick={closeWithoutAnswer}
      />
      <div
        ref={dialogRef}
        className="engagement-quiz-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={selected ? feedbackId : undefined}
        tabIndex={-1}
      >
        <div className="engagement-quiz-header">
          <p className="engagement-quiz-kicker">Kurz gefragt</p>
          <button type="button" className="engagement-quiz-close" aria-label="Schliessen" onClick={closeWithoutAnswer}>
            ×
          </button>
        </div>

        <h2 id={titleId} className="engagement-quiz-question">
          {question.question}
        </h2>

        {!selected ? (
          <ul className="engagement-quiz-options">
            {question.options.map((option) => (
              <li key={option.id}>
                <button type="button" className="engagement-quiz-option" onClick={() => handleSelect(option)}>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="engagement-quiz-result">
            {selected.isCorrect ? (
              <p id={feedbackId} className="engagement-quiz-feedback engagement-quiz-feedback--correct">
                {selected.feedback}
              </p>
            ) : (
              <div id={feedbackId} className="engagement-quiz-feedback-block engagement-quiz-feedback-block--wrong">
                {correctOption ? (
                  <div className="engagement-quiz-correct">
                    <p className="engagement-quiz-correct-label">Richtige Antwort</p>
                    <p className="engagement-quiz-correct-value">{correctOption.label}</p>
                  </div>
                ) : null}
                <p className="engagement-quiz-feedback">{selected.feedback}</p>
              </div>
            )}
            <button type="button" className="engagement-quiz-continue" onClick={handleContinue}>
              Weiter
            </button>
          </div>
        )}

        <div className="engagement-quiz-footer">
          <Link
            href="/#newsletter"
            className="engagement-quiz-newsletter"
            aria-label="Zum Newsletter"
            title="Newsletter"
            onClick={handleFooterNavigate}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <path
                d="m5 8 7 5 7-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="engagement-quiz-newsletter-label">Newsletter</span>
          </Link>
          <Link href="/sponsoring" className="engagement-quiz-goenner" onClick={handleFooterNavigate}>
            Gönner werden
          </Link>
        </div>
      </div>
    </div>
  );
}
