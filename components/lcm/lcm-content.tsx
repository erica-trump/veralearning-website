"use client";

export default function LCMContent() {
    return (
        <div className="space-y-6 pb-4 text-sm leading-relaxed text-midnight/80">
            <div className="space-y-2">
                <h3 className="text-base font-semibold text-midnight">
                    What is the Learning Context Model (LCM)?
                </h3>
                <p>
                    The Learning Context Model (LCM) is VeraLearning’s foundation for
                    trustworthy, standards-aligned AI assessment.
                </p>
                <p>
                    It defines what matters in learning, what counts as evidence, and how
                    mastery should be determined — so AI can reason about performance instead
                    of improvising.
                </p>
            </div>

            <hr className="border-midnight/10" />

            <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                    Why LCM exists
                </p>
                <p>
                    Most AI systems are designed to generate content. Assessment requires
                    judgment, consistency, and transparency.
                </p>
                <div className="space-y-2">
                    <p>LCM provides a stable learning context by explicitly modeling:</p>
                    <div className="space-y-2">
                        {[
                            "competencies and skill boundaries",
                            "performance expectations and criteria",
                            "acceptable evidence types",
                            "evaluation logic",
                        ].map((text) => (
                            <div key={text} className="flex items-start gap-2">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cerulean-tint ring-1 ring-midnight/10">
                                    <svg
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 text-synapse"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42.003L3.29 9.3a1 1 0 1 1 1.42-1.4l3.04 3.08 6.54-6.58a1 1 0 0 1 1.414-.01Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <p className="text-midnight/80">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p>
                    This enables assessments that are consistent across learners, explainable
                    to stakeholders, and defensible in institutional settings.
                </p>
            </div>

            <hr className="border-midnight/10" />

            <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                    How LCM is different
                </p>

                <div className="space-y-4">
                    {[
                        {
                            title: "Models learning, not documents",
                            body: "LCM represents instructional intent and expectations — not just source materials — enabling evaluation of demonstrated performance rather than recall.",
                        },
                        {
                            title: "Built for judgment, not retrieval",
                            body: "Unlike RAG-based approaches that fetch information, LCM defines how learner evidence is interpreted and evaluated against competencies and standards.",
                        },
                        {
                            title: "Persists across interactions",
                            body: "LCM carries context across adaptive interviews and assessments, allowing AI to build coherent evidence trails instead of isolated responses.",
                        },
                        {
                            title: "Makes decisions transparent",
                            body: "Every mastery determination can be traced back to defined competencies and criteria, supporting auditability and institutional trust.",
                        },
                        {
                            title: "Model-agnostic by design",
                            body: "LCM is independent of any single AI provider, allowing organizations to adopt AI assessment without vendor lock-in.",
                        },
                    ].map((item) => (
                        <div key={item.title} className="flex gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cerulean-tint ring-1 ring-midnight/10">
                                <svg
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                    className="h-4 w-4 text-synapse"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42.003L3.29 9.3a1 1 0 1 1 1.42-1.4l3.04 3.08 6.54-6.58a1 1 0 0 1 1.414-.01Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>

                            <div className="space-y-1">
                                <p className="font-semibold text-midnight">{item.title}</p>
                                <p>{item.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-midnight/10" />

            <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                    What this enables
                </p>
                <p>With LCM in place, VeraLearning can:</p>
                <div className="space-y-2">
                    {[
                        "conduct adaptive, competency-aligned interviews",
                        "evaluate mastery using consistent, explicit criteria",
                        "generate evidence suitable for review and validation",
                        "support pilots and early adoption without sacrificing rigor",
                    ].map((text) => (
                        <div key={text} className="flex items-start gap-2">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cerulean-tint ring-1 ring-midnight/10">
                                <svg
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 text-synapse"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42.003L3.29 9.3a1 1 0 1 1 1.42-1.4l3.04 3.08 6.54-6.58a1 1 0 0 1 1.414-.01Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <p className="text-midnight/80">{text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-midnight/10 bg-cortex-tint p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                    In short
                </p>
                <p className="mt-2 text-midnight/85">
                    AI without context guesses.
                    <br />
                    AI with LCM reasons.
                </p>
            </div>
        </div>
    );
}

