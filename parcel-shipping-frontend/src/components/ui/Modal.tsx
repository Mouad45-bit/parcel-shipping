"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "default" | "wide";
type ModalScrollMode = "modal" | "content";

type ModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  children: ReactNode;
  size?: ModalSize;
  scrollMode?: ModalScrollMode;
  onClose: () => void;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Modal({
  isOpen,
  title,
  description,
  children,
  size = "default",
  scrollMode = "modal",
  onClose,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const autoFocusElement =
        modalRef.current?.querySelector<HTMLElement>("[data-autofocus]");

      const firstFocusableElement =
        modalRef.current?.querySelector<HTMLElement>(focusableSelector);

      (autoFocusElement ?? firstFocusableElement ?? modalRef.current)?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const widthClassName = size === "wide" ? "max-w-6xl" : "max-w-lg";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabIndex={-1}
        className={[
          "max-h-[calc(100dvh-2rem)] w-full rounded-2xl border border-border bg-surface shadow-xl outline-none",
          scrollMode === "content"
            ? "flex flex-col overflow-hidden"
            : "overflow-y-auto",
          widthClassName,
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-5 border-b border-border px-5 py-5 sm:px-6">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-bold tracking-tight text-ink"
            >
              {title}
            </h2>

            <p
              id="modal-description"
              className="mt-1.5 text-sm leading-6 text-ink/55"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/45 transition hover:bg-secondary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={19} />
          </button>
        </header>

        {children}
      </div>
    </div>,
    document.body,
  );
}
