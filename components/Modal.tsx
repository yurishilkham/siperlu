"use client";

import { useEffect, useRef, type ReactNode } from "react";

const modalStack: symbol[] = [];

type ModalProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  size?: "besar";
  id?: string;
  children: ReactNode;
};

export default function Modal({
  open,
  onClose,
  titleId,
  size,
  id,
  children,
}: ModalProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const token = Symbol("modal");
    modalStack.push(token);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (modalStack[modalStack.length - 1] !== token) return;
      onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const index = modalStack.indexOf(token);
      if (index >= 0) modalStack.splice(index, 1);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-back"
      id={id}
      data-modal="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`modal${size === "besar" ? " besar" : ""}`}>
        <button
          className="modal-close"
          type="button"
          aria-label="Tutup"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
