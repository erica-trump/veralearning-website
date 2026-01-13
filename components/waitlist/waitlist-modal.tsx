"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";

type Props = {
    open: boolean;
    onClose: () => void;
    source?: string;
};

export default function WaitlistModal({
    open,
    onClose,
    source = "header_cta",
}: Props) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
        "idle"
    );
    const [error, setError] = useState("");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formEl = e.currentTarget; // ✅ capture immediately
        setStatus("loading");
        setError("");

        const form = new FormData(formEl);
        const payload = Object.fromEntries(form.entries());

        const params = new URLSearchParams(window.location.search);
        const utm = {
            utm_source: params.get("utm_source") ?? "",
            utm_medium: params.get("utm_medium") ?? "",
            utm_campaign: params.get("utm_campaign") ?? "",
            utm_term: params.get("utm_term") ?? "",
            utm_content: params.get("utm_content") ?? "",
        };

        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, ...utm, source }),
        });

        const data = await res.json();

        if (data.ok) {
            setStatus("success");
            formEl.reset(); // ✅ safe now
        } else {
            setStatus("error");
            setError(data.error || "Something went wrong.");
        }
    }


    return (
        <Modal open={open} onClose={onClose} title="Contact VeraLearning">
            {status === "success" ? (
                <div className="space-y-3">
                    <p className="text-sm text-midnight">
                        Thanks — we’ll reach out shortly.
                    </p>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-synapse px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-synapse/90"
                    >
                        Close
                    </button>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-3">
                    {/* Honeypot */}
                    <input
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            name="name"
                            placeholder="Name"
                            className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                        />
                        <input
                            name="email"
                            placeholder="Email *"
                            required
                            className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            name="company"
                            placeholder="Company"
                            className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                        />
                        <input
                            name="role"
                            placeholder="Role"
                            className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                        />
                    </div>

                    <textarea
                        name="message"
                        placeholder="What are you hoping to learn more about?"
                        rows={4}
                        className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                    />

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="inline-flex items-center justify-center rounded-full bg-synapse px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-synapse/90 disabled:opacity-60"
                        >
                            {status === "loading" ? "Sending..." : "Submit request"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-4 py-2 text-xs font-medium text-midnight/70 hover:bg-midnight/5"
                        >
                            Cancel
                        </button>
                    </div>

                    {status === "error" ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : (
                        <p className="text-xs text-midnight/55">
                            We’ll only use this to respond to your request.
                        </p>
                    )}
                </form>
            )}
        </Modal>
    );
}
