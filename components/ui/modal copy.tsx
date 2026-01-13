"use client";

import { useEffect } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Overlay */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-midnight/10 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-midnight/10 px-5 py-4">
                        {title ? (
                            <h2 className="text-sm font-semibold text-midnight">{title}</h2>
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

                    <div className="px-5 py-5">{children}</div>
                </div>
            </div>
        </div>
    );
}
