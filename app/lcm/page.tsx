import LCMPageContent from "@/components/lcm/lcm-page-content";

export default function LCMPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <section className="hero-pattern rounded-3xl bg-white/90 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12">
                <div className="space-y-6">
                    <p className="text-xs font-semibold tracking-[0.18em] text-midnight/60 uppercase">
                        VERALEARNING FOUNDATION
                    </p>
                    <h1 className="text-3xl font-semibold leading-tight text-midnight md:text-4xl">
                        Learning Context Model™ (LCM)
                    </h1>
                    <h2 className="text-lg font-medium text-midnight/85 md:text-xl">
                        The foundation that makes AI assessment{" "}
                        <span
                            className="italic font-semibold text-synapse"
                            style={{ color: "#0F5F67" }}
                        >
                            consistent, explainable, and defensible
                        </span>
                        .
                    </h2>

                    <div className="max-w-4xl space-y-4 text-sm leading-relaxed text-midnight/80 md:text-base">
                        <p>
                            The Learning Context Model (LCM) encodes the competencies,
                            expectations, and standards an organization already uses and
                            provides the shared context an AI system needs to apply them
                            consistently across learners, interactions, and time.
                        </p>
                        <p>
                            LCM provides a persistent structure that guides how AI conducts
                            learning interactions, interprets learner behavior, and accumulates
                            evidence in alignment with established skill maps and competency
                            definitions.
                        </p>
                        <p>
                            This allows VeraLearning to produce assessments that are consistent,
                            transparent, and defensible within real organizational and
                            regulatory contexts.
                        </p>
                    </div>

                    <div className="mt-8 max-w-4xl space-y-4 border-l-2 border-midnight/10 pl-4">
                        <p className="text-sm font-medium text-midnight/80 md:text-base">
                            LCM provides a stable learning context by explicitly modeling:
                        </p>

                        <div className="space-y-3">
                            {[
                                "competencies and skill boundaries",
                                "performance expectations and criteria",
                                "acceptable evidence types",
                                "evaluation logic",
                            ].map((text) => (
                                <div key={text} className="flex items-start gap-3">
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
                                    <p className="text-midnight/80">{text}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm leading-relaxed text-midnight/80 md:text-base">
                            This enables assessments that are consistent across learners,
                            explainable to stakeholders, and defensible in institutional
                            settings.
                        </p>
                    </div>
                </div>

                <div className="mt-10">
                    <LCMPageContent />
                </div>
            </section>
        </div>
    );
}
