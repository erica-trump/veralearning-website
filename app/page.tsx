// app/page.tsx
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-page-bg text-midnight">
      <div className="mx-auto max-w-6xl bg-page-bg px-4 pb-4 pt-10 space-y-16 md:pb-6">
        {/* HERO */}
        <section id="overview" className="hero-pattern rounded-3xl bg-white/90 px-8 py-14 shadow-sm ring-1 ring-midnight/5 md:px-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-[1.2fr,1fr]">
            {/* Left: text */}
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-midnight/60 uppercase">
                AI-native assessment & credentialing
              </p>

              <h1 className="text-3xl font-semibold leading-tight text-midnight md:text-4xl">
                Know who&apos;s truly job-ready.
              </h1>
              <h2 className="text-lg font-medium text-midnight/85 md:text-xl">
                AI-powered interviews that produce{" "}
                <span className="italic font-semibold text-synapse" style={{ color: "#0F5F67" }}>
                  structured, defensible
                </span>{" "}
                evidence of mastery.
              </h2>

              <div className="space-y-4 text-sm leading-relaxed text-midnight/80 max-w-2xl">
                <p>
                  VeraLearning uses adaptive AI interviews to reveal how people think and solve problems in authentic workplace scenarios. Beyond test scores, you get clear insight into judgment, decision-making, and applied skills. These signals are what separate true job readiness from test-taking ability.
                </p>
                <p>
                  Powered by the Learning Context Model (LCM), our mastery system provides AI with the structure it needs to recognize and evaluate mastery. LCM aligns with your existing skill maps and curricula so evaluation stays consistent, fair, and fully explainable.
                </p>
              </div>

              <div>
                <Button size="lg">Join waitlist</Button>
              </div>
            </div>
          </div>
        </section>

        {/* HERO CASE STUDY CARD */}
        <section className="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-midnight/10 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/60">
                CNC Safety · Mastery Check
              </p>
              <h3 className="text-xl font-semibold text-midnight">
                Reasoning pattern snapshot
              </h3>
              <p className="text-sm text-midnight/80">
                Learner demonstrates consistent causal reasoning, but misses key
                risk-assessment steps around machine setup.
              </p>
            </div>
            <div className="w-full flex-1 rounded-2xl bg-cortex/60 p-4 shadow-inner ring-1 ring-midnight/5">
              <dl className="grid grid-cols-2 gap-4 text-[11px] text-midnight/70 md:text-xs">
                <div>
                  <dt className="font-medium text-midnight">Competency level</dt>
                  <dd className="mt-1 rounded-full bg-cortex px-2 py-1 text-[10px] font-semibold text-synapse">
                    Ready with support
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-midnight">Evidence coverage</dt>
                  <dd className="mt-1">4 of 5 critical themes</dd>
                </div>
                <div>
                  <dt className="font-medium text-midnight">Interview length</dt>
                  <dd className="mt-1">11 minutes</dd>
                </div>
                <div>
                  <dt className="font-medium text-midnight">Export</dt>
                  <dd className="mt-1 text-cerulean">Shareable rubric report →</dd>
                </div>
              </dl>
              <p className="mt-4 text-[11px] leading-snug text-midnight/65">
                Vera&apos;s LCM/LCP engine structures the interview, scores reasoning
                patterns, and outputs a defensible decision trail you can share
                with faculty and employers.
              </p>
            </div>
          </div>
        </section>

        {/* HOW VERALEARNING WORKS / PRODUCT SECTION */}
        <RevealOnScroll>
          <section
            id="product"
            className="hero-pattern rounded-3xl bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-6 md:py-12 space-y-6"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-midnight/55 uppercase">
              How VeraLearning works
            </p>
            <h2 className="text-xl font-semibold text-midnight">
              From course materials to competency-based evidence.
            </h2>
            <p className="max-w-2xl text-sm text-midnight/80">
              VeraLearning doesn&apos;t just generate questions. It aligns with your course materials and skill maps, helping you clarify competencies, orchestrate adaptive interviews, and produce transparent evidence of what learners can actually do.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <RevealOnScroll delayMs={0} className="h-full">
                <div
                  className="relative h-full rounded-2xl border border-midnight/8 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(239,237,232,0.98), rgba(27,138,174,0.06))",
                    boxShadow: "0 4px 12px rgba(10,35,66,0.05)",
                  }}
                >
                  <span
                    className="absolute left-3 top-4 bottom-4 w-[3px] rounded-full"
                    style={{ backgroundColor: "rgba(27,138,174,0.7)" }}
                  ></span>
                  <div className="space-y-2 pl-8">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.3em] text-midnight/50 uppercase">
                        Step 1
                      </p>
                      <p className="text-sm font-semibold text-midnight">
                        Map your learning context
                      </p>
                    </div>
                    <p className="text-xs text-midnight/75">
                      VeraLearning ingests your course materials, job requirements, and skill frameworks to surface the key cognitive demands and performance expectations learners must meet.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delayMs={300} className="h-full">
                <div
                  className="relative h-full rounded-2xl border border-midnight/8 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239,237,232,0.96), rgba(27,138,174,0.10))",
                    boxShadow: "0 6px 16px rgba(10,35,66,0.07)",
                  }}
                >
                  <span
                    className="absolute left-3 top-4 bottom-4 w-[3px] rounded-full"
                    style={{ backgroundColor: "rgba(27,138,174,0.8)" }}
                  ></span>
                  <div className="space-y-2 pl-8">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.3em] text-midnight/50 uppercase">
                        Step 2
                      </p>
                      <p className="text-sm font-semibold text-midnight">
                        Run AI interviews
                      </p>
                    </div>
                    <p className="text-xs text-midnight/75">
                      VeraLearning conducts real-time interviews that seek evidence of mastery. Each turn of the conversation adjusts to the learner and stays aligned with the competencies and expectations that matter to you.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delayMs={600} className="h-full">
                <div
                  className="relative h-full rounded-2xl border border-midnight/8 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(239,237,232,0.94), rgba(27,138,174,0.14))",
                    boxShadow: "0 8px 20px rgba(10,35,66,0.09)",
                  }}
                >
                  <span
                    className="absolute left-3 top-4 bottom-4 w-[3px] rounded-full"
                    style={{ backgroundColor: "rgba(27,138,174,0.9)" }}
                  ></span>
                  <div className="space-y-2 pl-8">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.3em] text-midnight/50 uppercase">
                        Step 3
                      </p>
                      <p className="text-sm font-semibold text-midnight">
                        Issue verifiable credentials
                      </p>
                    </div>
                    <p className="text-xs text-midnight/75">
                      VeraLearning delivers clear, defensible mastery decisions. Rubrics, evidence trails, and verifiable digital credentials make it simple to show faculty, employers, and learners exactly why someone earned a passing decision.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        </RevealOnScroll>

        {/* WHO IT'S FOR */}
        <RevealOnScroll>
          <section
            id="who"
            className="hero-pattern rounded-3xl bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12 space-y-6"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-midnight/55 uppercase">
                Who it&apos;s for
              </p>
              <h2 className="text-xl font-semibold text-midnight">
                Anyone who needs to know{" "}
                <span className="italic text-synapse" style={{ color: "#0F5F67" }}>
                  with confidence
                </span>{" "}
                whether someone can perform.
              </h2>
            <p className="text-sm text-midnight/75 max-w-2xl">
              VeraLearning gives educators, training teams, and workforce partners a shared way to measure real skill, real reasoning, and real readiness.
            </p>
          </div>
            <div className="mt-8 md:mt-10">
              <div className="mt-1 grid gap-6 md:grid-cols-3">
              <RevealOnScroll
                delayMs={0}
                className="h-full"
                transitionClass="transition-all duration-[160ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                hiddenClass="opacity-0 translate-y-[20px]"
                visibleClass="opacity-100 translate-y-0"
              >
                <div className="audience-card h-full rounded-2xl border border-midnight/5 bg-white/90 backdrop-blur-sm p-3.5 pt-6 md:pt-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(27,138,174,0.03))" }}>
                  <p className="text-sm font-semibold text-midnight">
                    Educators & Training Teams
                  </p>
                  <p className="mt-2 text-xs text-midnight/75 leading-relaxed">
                    Assess reasoning and problem-solving, not memorization. Build mastery-based programs that produce work-ready graduates.
                  </p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll
                delayMs={80}
                className="h-full"
                transitionClass="transition-all duration-[160ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                hiddenClass="opacity-0 translate-y-[20px]"
                visibleClass="opacity-100 translate-y-0"
              >
                <div className="audience-card h-full rounded-2xl border border-midnight/5 bg-white/90 backdrop-blur-sm p-3.5 pt-6 md:pt-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(27,138,174,0.03))" }}>
                  <p className="text-sm font-semibold text-midnight">
                    Learning & Development Teams
                  </p>
                  <p className="mt-2 text-xs text-midnight/75 leading-relaxed">
                    Measure applied skill in real workplace scenarios and accelerate employee development with targeted feedback.

                  </p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll
                delayMs={160}
                className="h-full"
                transitionClass="transition-all duration-[160ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                hiddenClass="opacity-0 translate-y-[20px]"
                visibleClass="opacity-100 translate-y-0"
              >
                <div className="audience-card h-full rounded-2xl border border-midnight/5 bg-white/90 backdrop-blur-sm p-3.5 pt-6 md:pt-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(27,138,174,0.03))" }}>
                  <p className="text-sm font-semibold text-midnight">
                    Employers & Workforce Initiatives
                  </p>
                  <p className="mt-2 text-xs text-midnight/75 leading-relaxed">
                    Identify people who can actually do the work. VeraLearning reveals judgment, decision-making, and job-ready thinking.

                  </p>
                </div>
              </RevealOnScroll>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </div>
    </main>
  );
}
