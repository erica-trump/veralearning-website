// app/page.tsx
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-page-bg text-midnight">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-16">
        {/* HERO */}
        <section className="hero-pattern rounded-3xl bg-white/90 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12">
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
                <span className="underline decoration-synapse decoration-2 underline-offset-4">
                  structured, defensible
                </span>{" "}
                evidence of mastery.
              </h2>

              <p className="text-sm leading-relaxed text-midnight/80">
                VeraLearning uses adaptive AI interviews to reveal how people actually think and solve problems. Instead of test scores, you get clear insight into judgment, decision-making, and applied skill that predicts real performance.
                <br /><br />
                Powered by the Learning Context Model (LCM), our structured mastery system that teaches AI what mastery looks like and how to evaluate it. LCM aligns with your existing skill maps and curricula so evaluation stays consistent, fair, and fully explainable.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg">Join waitlist</Button>
                <Button variant="subtle" size="lg">
                  See how VeraLearning works
                </Button>
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
            className="hero-pattern rounded-3xl bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12 space-y-6"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-midnight/55 uppercase">
              How VeraLearning works
            </p>
            <h2 className="text-xl font-semibold text-midnight">
              From course materials to competency-based evidence.
            </h2>
            <p className="max-w-2xl text-sm text-midnight/80">
              VeraLearning doesn&apos;t just generate questions. It helps you design a
              competency model, orchestrate adaptive interviews, and produce
              transparent evidence of what learners can actually do.
            </p>

            <div className="grid gap-5 md:grid-cols-3">
              <RevealOnScroll delayMs={0} className="h-full">
                <div className="mesh-card h-full rounded-2xl bg-gradient-to-br from-synapse/25 via-synapse-tint to-white p-4 shadow-md ring-1 ring-synapse/25">
                  <div className="flex gap-4">
                    <div className="w-1.5 rounded-full bg-synapse" />
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-wide text-midnight/60 uppercase">
                        1 · Map the learning context
                      </p>
                      <p className="text-sm font-medium text-midnight">
                        Upload syllabi, tasks, and assessments.
                      </p>
                      <p className="text-xs text-midnight/75">
                        VeraLearning&apos;s Learning Context Model surfaces skills, cognitive
                        demands, and assessment opportunities across your course or
                        program.
                      </p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delayMs={150} className="h-full">
                <div className="mesh-card h-full rounded-2xl bg-gradient-to-br from-cerulean/25 via-cerulean-tint to-white p-4 shadow-md ring-1 ring-cerulean/25">
                  <div className="flex gap-4">
                    <div className="w-1.5 rounded-full bg-cerulean" />
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-wide text-midnight/60 uppercase">
                        2 · Run adaptive interviews
                      </p>
                      <p className="text-sm font-medium text-midnight">
                        AI-guided, evidence-seeking conversations.
                      </p>
                      <p className="text-xs text-midnight/75">
                        Dynamic prompts probe reasoning patterns—not just recall—
                        aligned to the competencies you care about.
                      </p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delayMs={300} className="h-full">
                <div className="mesh-card h-full rounded-2xl bg-gradient-to-br from-midnight/20 via-cortex to-white p-4 shadow-md ring-1 ring-midnight/20">
                  <div className="flex gap-4">
                    <div className="w-1.5 rounded-full bg-midnight" />
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-wide text-midnight/60 uppercase">
                        3 · Issue verifiable mastery
                      </p>
                      <p className="text-sm font-medium text-midnight">
                        Clear, defensible credential decisions.
                      </p>
                      <p className="text-xs text-midnight/75">
                        Rubrics, evidence trails, and digital credentials that make it
                        easy to explain &quot;why this learner passed&quot; to
                        faculty, employers, and learners themselves.
                      </p>
                    </div>
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
                Built for people who care about real learning, not just content.
              </h2>
              <p className="text-sm text-midnight/75 max-w-2xl">
                VeraLearning supports teams that hold the line on rigor—aligning
                assessments to outcomes, defending credential decisions, and
                giving learners transparent evidence of mastery.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <RevealOnScroll
                delayMs={0}
                className="h-full"
                transitionClass="transition-all duration-[160ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                hiddenClass="opacity-0 translate-y-[20px]"
                visibleClass="opacity-100 translate-y-0"
              >
                <div className="audience-card h-full">
                  <p className="text-sm font-medium text-midnight">
                    Instructors & course teams
                  </p>
                  <p className="mt-2 text-xs text-midnight/75 leading-relaxed">
                    Design courses and assessments that align to clear outcomes,
                    without turning everything into a multiple-choice test.
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
                <div className="audience-card h-full">
                  <p className="text-sm font-medium text-midnight">
                    Centers for teaching & learning
                  </p>
                  <p className="mt-2 text-xs text-midnight/75 leading-relaxed">
                    Give faculty a shared language for competencies, levels, and
                    evidence—augmented by AI, not replaced by it.
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
                <div className="audience-card h-full">
                  <p className="text-sm font-medium text-midnight">
                    Workforce & employer programs
                  </p>
                  <p className="mt-2 text-xs text-midnight/75 leading-relaxed">
                    Create job-relevant mastery checks that give employers
                    confidence in who&apos;s truly ready for the next step.
                  </p>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        </RevealOnScroll>
      </div>
    </main>
  );
}
