"use client";

function CheckBadge({
    size = "sm",
    tone = "neutral",
}: {
    size?: "sm" | "md";
    tone?: "teal" | "neutral";
}) {
    const badgeClass =
        size === "md"
            ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cerulean-tint ring-1 ring-midnight/10"
            : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cerulean-tint ring-1 ring-midnight/10";
    const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
    const iconToneClass = tone === "teal" ? "text-synapse" : "text-midnight/55";

    return (
        <div className={badgeClass}>
            <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`${iconClass} ${iconToneClass}`}
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42.003L3.29 9.3a1 1 0 1 1 1.42-1.4l3.04 3.08 6.54-6.58a1 1 0 0 1 1.414-.01Z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    );
}

function XBadge({ size = "sm" }: { size?: "sm" | "md" }) {
    const badgeClass =
        size === "md"
            ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 ring-1 ring-midnight/10"
            : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 ring-1 ring-midnight/10";
    const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

    return (
        <div className={badgeClass}>
            <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`${iconClass} text-midnight/55`}
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M6.22 6.22a.75.75 0 0 1 1.06 0L10 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L11.06 10l2.72 2.72a.75.75 0 1 1-1.06 1.06L10 11.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L8.94 10 6.22 7.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    );
}

export default function LCMPageContent() {
    return (
        <div className="space-y-5 text-sm leading-relaxed text-midnight/80 md:space-y-6">
            <section className="space-y-4 py-2 md:py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                    Without vs with LCM
                </p>

                <div className="rounded-3xl bg-midnight/3 p-1 ring-1 ring-midnight/10">
                    <div className="grid gap-1 md:grid-cols-2 md:divide-x md:divide-midnight/20">
                        <div className="rounded-[22px] bg-white/80 p-5 md:rounded-[22px_0_0_22px] md:p-6">
                            <p className="text-base font-semibold text-midnight">
                                Without a Learning Context Model
                            </p>
                            <div className="mt-4 space-y-2">
                                {[
                                    "AI relies on prompts and retrieved text",
                                    "Evaluation varies by interaction",
                                    "Decisions are difficult to explain or audit",
                                    "Evidence is fragmented",
                                ].map((text) => (
                                    <div key={text} className="flex items-start gap-2">
                                        <XBadge />
                                        <p className="text-midnight/75">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[22px] bg-cerulean-tint p-5 md:rounded-[0_22px_22px_0] md:p-6">
                            <p className="text-base font-semibold text-midnight">With LCM</p>
                            <div className="mt-4 space-y-2">
                                {[
                                    "AI reasons within defined expectations",
                                    "Evaluation is consistent across learners",
                                    "Decisions trace back to criteria",
                                    "Evidence accumulates coherently",
                                ].map((text) => (
                                    <div key={text} className="flex items-start gap-2">
                                        <CheckBadge tone="teal" />
                                        <p className="text-midnight/80">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hero-pattern rounded-3xl bg-midnight/5 p-10 text-center ring-1 ring-midnight/15 shadow-sm md:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                    In short
                </p>
                <p className="mt-4 text-3xl font-semibold leading-snug text-midnight md:text-4xl">
                    Without context, AI guesses.
                    <br />
                    With LCM, AI reasons.
                </p>
            </section>

            <hr className="border-midnight/10" />

            <section className="rounded-2xl bg-cerulean-tint p-5 md:p-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                        What this enables
                    </p>
                    <p className="text-base font-semibold leading-snug text-midnight">
                        With LCM in place, VeraLearning can:
                    </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                        "conduct adaptive, competency-aligned interviews",
                        "evaluate mastery using consistent, explicit criteria",
                        "generate evidence suitable for review and validation",
                        "support pilots and early adoption without sacrificing rigor",
                    ].map((text) => (
                        <div key={text} className="flex items-start gap-3">
                            <CheckBadge size="md" />
                            <p className="text-midnight/80">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl bg-cerulean-tint p-5 md:p-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                        What this produces
                    </p>
                    <p className="text-base font-semibold leading-snug text-midnight">
                        Clear, decision-ready artifacts you can review and share.
                    </p>
                    <p className="text-sm leading-relaxed text-midnight/75">
                        These artifacts are generated directly from LCM-guided evaluation.
                    </p>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {[
                        "Structured assessment snapshots",
                        "Explainable mastery decisions",
                        "Shareable evidence trails",
                        "Verifiable credentials (when applicable)",
                    ].map((text) => (
                        <div key={text} className="flex items-start gap-2">
                            <CheckBadge />
                            <p className="text-midnight/80">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8 py-6 md:mt-10 md:py-10">
                <div className="hero-pattern rounded-3xl border border-midnight/10 bg-cerulean-tint p-6 shadow-sm md:p-8">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                            How LCM is different
                        </p>
                        <h3 className="text-xl font-semibold leading-snug text-midnight md:text-2xl">
                            The core reasons LCM enables trustworthy assessment.
                        </h3>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-5">
                        {[
                            {
                                title: "Models learning, not documents",
                                body: "Captures instructional intent and expectations, not just source text.",
                            },
                            {
                                title: "Built for judgment, not retrieval",
                                body: "Defines how evidence is interpreted against standards and competencies.",
                            },
                            {
                                title: "Persists across interactions",
                                body: "Maintains context across turns so evidence accumulates coherently.",
                            },
                            {
                                title: "Makes decisions transparent",
                                body: "Every decision traces back to defined criteria for auditability.",
                            },
                            {
                                title: "Model-agnostic by design",
                                body: "Works across AI providers, avoiding vendor lock-in.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="h-full rounded-2xl border border-midnight/10 bg-white/90 p-5 shadow-[0_1px_2px_rgba(10,35,66,0.05)] md:p-6"
                            >
                                <div className="flex gap-3">
                                    <CheckBadge size="md" />
                                    <div className="space-y-1">
                                        <p className="text-base font-semibold leading-snug text-midnight">
                                            {item.title}
                                        </p>
                                        <p className="text-sm leading-snug text-midnight/80">
                                            {item.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
