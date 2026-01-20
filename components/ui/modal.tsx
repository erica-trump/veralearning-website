"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
    const portalTarget = typeof document === "undefined" ? null : document.body;

    // Close on Escape + lock body scroll
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open || !portalTarget) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100]">
            {/* Overlay */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
            />

            {/* Wrapper */}
            <div className="absolute inset-0 flex items-start justify-center p-4 pt-10 sm:items-center">
                {/* Panel */}
                <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-midnight/10 bg-white shadow-xl max-h-[85vh]">
                    <div className="flex items-center justify-between border-b border-midnight/10 px-5 py-4">
                        {title ? (
                            <h2 className="text-lg font-semibold text-midnight">{title}</h2>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={onClose}
                            className="rounded-full px-3 py-1 text-sm text-midnight/70 hover:bg-midnight/5"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
                </div>
            </div>
        </div>,
        portalTarget
    );
}
