"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import Turnstile from "react-turnstile";

const CONTACT_REASON_OPTIONS = [
    "Piloting or integrating VeraCredentials",
    "AI systems design & architecture",
    "AI governance, safety, or risk",
    "Credentialing & assessment strategy",
    "Learning solution design or evaluation",
    "Something else (describe below)",
] as const;
const PILOTING_OPTION = "Piloting or integrating VeraCredentials";
const SOMETHING_ELSE_OPTION = "Something else (describe below)";
const DEFAULT_MESSAGE_PLACEHOLDER =
    "What are you hoping to learn more about? Share any context that might be helpful.";
const PILOTING_MESSAGE_PLACEHOLDER =
    "Tell us a bit more about your context or use case.";
const SOMETHING_ELSE_MESSAGE_PLACEHOLDER = "Please describe what you have in mind.";

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
    const [selectedContactReasons, setSelectedContactReasons] = useState<string[]>([]);

    // Turnstile token (must be included in POST + verified server-side)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    function handleClose() {
        setStatus("idle");
        setError("");
        setSelectedContactReasons([]);
        setTurnstileToken(null);
        onClose();
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Require captcha before sending
        if (!turnstileToken) {
            setStatus("error");
            setError("Please complete the captcha.");
            return;
        }

        const formEl = e.currentTarget; // ✅ capture immediately
        setStatus("loading");
        setError("");

        const form = new FormData(formEl);
        const payload = {
            website: (form.get("website") ?? "").toString(),
            name: (form.get("name") ?? "").toString(),
            email: (form.get("email") ?? "").toString(),
            company: (form.get("company") ?? "").toString(),
            role: (form.get("role") ?? "").toString(),
            message: (form.get("message") ?? "").toString(),
            contact_reasons: form
                .getAll("contact_reasons")
                .map((value) => value.toString()),
        };

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
            body: JSON.stringify({
                ...payload,
                ...utm,
                source,
                turnstileToken,
            }),
        });

        const data = await res.json();

        if (data.ok) {
            setStatus("success");
            formEl.reset(); // ✅ safe now
            setSelectedContactReasons([]);
            setTurnstileToken(null); // Turnstile tokens are single-use
        } else {
            setStatus("error");
            setError(data.error || "Something went wrong.");
            // Force user to re-verify (common if token expired)
            setTurnstileToken(null);
        }
    }

    const messagePlaceholder = selectedContactReasons.includes(PILOTING_OPTION)
        ? PILOTING_MESSAGE_PLACEHOLDER
        : selectedContactReasons.includes(SOMETHING_ELSE_OPTION)
            ? SOMETHING_ELSE_MESSAGE_PLACEHOLDER
            : DEFAULT_MESSAGE_PLACEHOLDER;

    return (
        <Modal open={open} onClose={handleClose} title="Contact VeraLearning">
            {status === "success" ? (
                <div className="space-y-3">
                    <p className="text-sm text-midnight">Thanks — we’ll reach out shortly.</p>
                    <button
                        onClick={handleClose}
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
                            placeholder="Name *"
                            required
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
                            placeholder="Company or Institution *"
                            required
                            className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                        />
                        <input
                            name="role"
                            placeholder="Role"
                            className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                        />
                    </div>

                    <fieldset className="rounded-md border border-midnight/15 bg-white p-3">
                        <legend className="px-1 text-sm font-medium text-midnight">
                            What challenge or opportunity are you thinking about?
                        </legend>
                        <p className="text-xs text-midnight/65">
                            Choose anything that feels relevant.
                        </p>
                        <div className="mt-3 space-y-2">
                            {CONTACT_REASON_OPTIONS.map((option) => (
                                <label
                                    key={option}
                                    className="flex items-start gap-2 text-sm text-midnight/85"
                                >
                                    <input
                                        type="checkbox"
                                        name="contact_reasons"
                                        value={option}
                                        onChange={(e) => {
                                            setSelectedContactReasons((current) => {
                                                if (e.target.checked) {
                                                    return [...current, option];
                                                }
                                                return current.filter((item) => item !== option);
                                            });
                                        }}
                                        className="mt-0.5 h-4 w-4 rounded border-midnight/30 text-synapse focus:ring-synapse/30"
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <textarea
                        name="message"
                        placeholder={messagePlaceholder}
                        rows={4}
                        className="w-full rounded-md border border-midnight/15 bg-white p-3 text-sm outline-none focus:border-midnight/30"
                    />

                    {/* Turnstile */}
                    <div className="pt-1">
                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            onVerify={(token) => {
                                setTurnstileToken(token);
                                if (status === "error") setStatus("idle"); // clear error state once verified
                            }}
                            onExpire={() => setTurnstileToken(null)}
                            onError={() => setTurnstileToken(null)}
                        // options={{ appearance: "always" }} // uncomment if you want it to always visibly render state
                        />
                        <p className="mt-2 text-xs text-midnight/55">
                            Protected by Cloudflare to prevent spam.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={status === "loading" || !turnstileToken}
                            className="inline-flex items-center justify-center rounded-full bg-synapse px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-synapse/90 disabled:opacity-60"
                            title={!turnstileToken ? "Complete the captcha to submit" : undefined}
                        >
                            {status === "loading" ? "Sending..." : "Submit request"}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
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
