import Image from "next/image";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import ContactCTA from "@/components/cta/contact-cta";


type AudienceCard = {
  title: string;
  description: string;
  delay: number;
};

type StepCard = {
  step: string;
  title: string;
  description: string;
  delay: number;
  accentOpacity: number;
  gradient: string;
  shadow: string;
  hoverClass: string;
};

type CncStat = {
  label: string;
  value: string | string[];
  pill?: boolean;
  pillBg?: string;
  pillTextColor?: string;
  highlight?: boolean;
};

const audiences: AudienceCard[] = [
  {
    title: "Educators & Training Teams",
    description:
      "Assess reasoning and problem-solving, not memorization. Build mastery-based programs that produce work-ready graduates.",
    delay: 0,
  },
  {
    title: "Learning & Development Teams",
    description:
      "Measure applied skill in real workplace scenarios and accelerate employee development with targeted feedback.",
    delay: 120,
  },
  {
    title: "Employers & Workforce Initiatives",
    description:
      "Identify people who can actually do the work. VeraLearning reveals judgment, decision-making, and job-ready thinking.",
    delay: 240,
  },
];

const steps: StepCard[] = [
  {
    step: "Step 1",
    title: "Map your learning context",
    description:
      "VeraLearning ingests course materials, job requirements, and skill frameworks to expose the cognitive demands and expectations that matter.",
    delay: 0,
    accentOpacity: 0.7,
    gradient:
      "linear-gradient(90deg, rgba(239,237,232,0.98), rgba(27,138,174,0.06))",
    shadow: "0 4px 12px rgba(10,35,66,0.05)",
    hoverClass: "hover:-translate-y-1",
  },
  {
    step: "Step 2",
    title: "Run AI-powered interviews",
    description:
      "VeraLearning conducts real-time interviews that seek evidence of mastery. Each turn of the conversation adjusts to the learner and stays aligned with the competencies and expectations that matter to you.",
    delay: 300,
    accentOpacity: 0.8,
    gradient:
      "linear-gradient(135deg, rgba(239,237,232,0.96), rgba(27,138,174,0.10))",
    shadow: "0 6px 16px rgba(10,35,66,0.07)",
    hoverClass: "hover:-translate-y-1",
  },
  {
    step: "Step 3",
    title: "Issue verifiable credentials",
    description:
      "VeraLearning produces defensible decisions, evidence trails, and sharable mastery reports so every stakeholder understands why it’s a yes.",
    delay: 600,
    accentOpacity: 0.9,
    gradient:
      "linear-gradient(180deg, rgba(239,237,232,0.94), rgba(27,138,174,0.14))",
    shadow: "0 8px 20px rgba(10,35,66,0.09)",
    hoverClass: "hover:-translate-y-1",
  },
];

const cncStats: CncStat[] = [
  { label: "Competency level", value: "Ready with support", pill: true },
  { label: "Mastery evidence", value: "4 of 5 critical themes" },
  { label: "Interview length", value: "16 minutes" },
  { label: "Export", value: "Structured evidence report", highlight: true },
];

const cncStatsExampleTwo: CncStat[] = [
  {
    label: "Acuity signal",
    value: "Urgency flagged",
    pill: true,
    pillBg: "#D97706",
    pillTextColor: "#FFFFFF",
  },
  { label: "Chief concern", value: "Chest pain (~45 min)" },
  { label: "Red flags", value: ["Crushing-like pain", "Radiation to left arm"] },
  { label: "Export", value: "Structured intake report", highlight: true },
];

export default function HomePage() {
  return (
    <main className="bg-page-bg text-midnight">
      <div className="mx-auto max-w-6xl space-y-16 px-4 pb-10 pt-10 md:space-y-20 md:pb-14 md:pt-14">
        {/* Overview */}
        <section
          id="overview"
          className="hero-pattern scroll-mt-32 rounded-3xl bg-white/90 px-8 py-14 shadow-sm ring-1 ring-midnight/5 md:px-16 md:py-20"
        >
          <div className="grid gap-10 md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-midnight/60 uppercase">
                AI-native assessment & credentialing
              </p>

              <h1 className="text-3xl font-semibold leading-tight text-midnight md:text-4xl">
                Know who&apos;s truly job-ready.
              </h1>
              <h2 className="text-lg font-medium text-midnight/85 md:text-xl">
                AI-powered interviews that produce{" "}
                <span
                  className="italic font-semibold text-synapse"
                  style={{ color: "#0F5F67" }}
                >
                  structured, defensible
                </span>{" "}
                evidence of mastery.
              </h2>

              <div className="space-y-4 text-sm leading-relaxed text-midnight/80 max-w-2xl">
                <p>
                  VeraLearning uses adaptive AI interviews to reveal how people
                  think and solve problems in authentic workplace scenarios.
                  Beyond test scores, you get clear insight into judgment,
                  decision-making, and applied skills. These signals are what
                  separate true job readiness from test-taking ability.
                </p>
                <p>
                  Our Learning Context Model&trade; (LCM) provides AI with the structure it needs to recognize and
                  evaluate mastery. LCM aligns with your existing skill maps and
                  curricula, and it ensures that evaluation stays valid, consistent, and fully
                  explainable.
                </p>
              </div>

              <div>
                <ContactCTA />
              </div>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <RevealOnScroll>
          <section
            id="who"
            className="hero-pattern scroll-mt-32 rounded-[32px] bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                Who it&apos;s for
              </p>
              <h2 className="text-xl font-semibold text-midnight">
                Built for anyone who needs to know{" "}
                <span
                  className="italic font-semibold"
                  style={{ color: "#0F5F67" }}
                >
                  with confidence
                </span>{" "}
                that someone can perform.
              </h2>
              <p className="max-w-2xl text-sm text-midnight/75">
                VeraLearning provides a shared, rigorous way to understand how learners think and perform. It helps educators and workforce teams measure applied reasoning, communicate readiness clearly, and give decision-makers transparent, defensible evidence.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {audiences.map((audience) => (
                <RevealOnScroll
                  key={audience.title}
                  delayMs={audience.delay}
                  transitionClass="transition-all duration-[180ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  hiddenClass="opacity-0 translate-y-6"
                  visibleClass="opacity-100 translate-y-0"
                  className="h-full"
                >
                  <div className="audience-card h-full rounded-2xl border border-midnight/10 bg-white/95 p-4 pt-6 shadow-[0_1px_2px_rgba(10,35,66,0.04)] transition-all duration-200 hover:-translate-y-1">
                    <p className="text-sm font-semibold text-midnight">
                      {audience.title}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-midnight/75">
                      {audience.description}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </section>
        </RevealOnScroll>

        <RevealOnScroll>
          <section
            id="what-teams-get"
            className="hero-pattern scroll-mt-32 rounded-[32px] bg-white/88 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12"
          >
            <div className="space-y-4 text-sm text-midnight/80 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-midnight/55">
                What teams get
              </p>
              <ul className="space-y-4">
                <li>
                  <span className="font-semibold text-midnight">
                    Transparent mastery snapshots
                  </span>
                  <br />
                  Every adaptive interview produces a structured reasoning trail that shows how a learner approached the task, not just what they recalled.
                </li>
                <li>
                  <span className="font-semibold text-midnight">
                    Signals mapped to your needs
                  </span>
                  <br />
                  LCM&trade; ensures every question, probe, and score ties directly to the competencies and indicators you already use, keeping evaluation consistent and explainable.
                </li>
                <li>
                  <span className="font-semibold text-midnight">
                    Evidence you can hand off with confidence
                  </span>
                  <br />
                  Share concise reports with partner schools, employers, or
                  certifying bodies without interpretation gaps or manual rewriting.
                </li>
              </ul>
            </div>
          </section>
        </RevealOnScroll>

        {/* How VeraLearning works */}
        <RevealOnScroll>
          <section
            id="product"
            className="hero-pattern scroll-mt-32 rounded-3xl bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-6 md:py-12 space-y-6"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-midnight/55 uppercase">
              How VeraLearning works
            </p>
            <h2 className="text-xl font-semibold text-midnight">
              From course materials to competency-based evidence.
            </h2>
            <p className="max-w-2xl text-sm text-midnight/80">
              VeraLearning doesn&apos;t just generate questions. It aligns with your
              course materials and skill maps, clarifies competencies, orchestrates
              adaptive interviews, and produces transparent evidence of what learners
              can actually do.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <RevealOnScroll
                  key={step.step}
                  delayMs={step.delay}
                  className="h-full"
                >
                  <div
                    className={`relative h-full rounded-2xl border border-midnight/8 p-4 shadow-sm transition-all duration-200 ${step.hoverClass}`}
                    style={{
                      background: step.gradient,
                      boxShadow: step.shadow,
                    }}
                  >
                    <span
                      className="absolute left-3 top-4 bottom-4 w-[3px] rounded-full"
                      style={{
                        backgroundColor: `rgba(27,138,174,${step.accentOpacity})`,
                      }}
                    />
                    <div className="space-y-2 pl-8">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.3em] text-midnight/50 uppercase">
                          {step.step}
                        </p>
                        <p className="text-sm font-semibold text-midnight">
                          {step.title}
                        </p>
                      </div>
                      <p className="text-xs text-midnight/75">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </section>
        </RevealOnScroll>

        {/* CNC safety example */}
        <RevealOnScroll>
          <section
            id="cnc-safety"
            className="hero-pattern rounded-[32px] bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12"
          >
            <div className="grid items-start gap-10 md:grid-cols-2 xl:grid-cols-[1.25fr,0.85fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                  Example · Applied SKills Assessment
                </p>
                <h3 className="text-xl font-semibold text-midnight">
                  How the learner reasoned through CNC operation tasks
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-midnight/80">
                  <p>
                    VeraLearning conducts applied skills assessments that capture how learners
                    perform and reason through real workplace tasks. In technical domains such as
                    CNC (Computer Numerical Control) machine operation, these assessments provide
                    structured evidence that supplements test scores by showing how safety
                    checks, task order, and decision-making are applied in practice.
                  </p>

                  <p>
                    In this assessment, the learner demonstrates a clear understanding of the
                    purpose behind required safety steps and follows the primary operational
                    sequence correctly. Gaps appear in consistency, including occasional missed
                    confirmations, incomplete workspace checks, and rushed verification. With
                    oversight or a structured checklist, the learner can operate safely;
                    however, the evidence indicates they are not yet ready to run machines
                    independently.
                  </p>

                  <p>
                    Based on this assessment, the learner receives a verifiable digital
                    credential aligned with W3C standards. The credential links to a structured
                    evidence record that documents demonstrated competencies, coverage across
                    defined themes, and specific areas for improvement. Employers and training
                    programs can review this evidence directly to support decisions about
                    readiness, supervision, and next steps.
                  </p>
                </div>

              </div>

              <div className="mt-4 rounded-[28px] bg-white/90 p-6 shadow-inner ring-1 ring-midnight/10 md:mt-8 lg:mt-10">
                <dl className="grid grid-cols-2 gap-4 text-[12px] text-midnight/75">
                  {cncStats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-midnight/60">
                        {stat.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-midnight">
                        {stat.pill ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-cortex ${stat.pillBg ? "" : "bg-synapse"
                              }`}
                            style={
                              stat.pillBg || stat.pillTextColor
                                ? {
                                  ...(stat.pillBg
                                    ? { backgroundColor: stat.pillBg }
                                    : {}),
                                  ...(stat.pillTextColor
                                    ? { color: stat.pillTextColor }
                                    : {}),
                                }
                                : undefined
                            }
                          >
                            {Array.isArray(stat.value)
                              ? stat.value.join(", ")
                              : stat.value}
                          </span>
                        ) : Array.isArray(stat.value) ? (
                          <ul
                            className={`list-disc space-y-1 pl-5 ${stat.highlight ? "text-synapse font-semibold" : ""
                              }`}
                          >
                            {stat.value.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span
                            className={
                              stat.highlight ? "text-synapse font-semibold" : ""
                            }
                          >
                            {stat.value}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs leading-relaxed text-midnight/70">
                  VeraLearning’s LCM&trade;-based engine structures the interview, scores reasoning
                  patterns, and outputs a defensible decision trail you can share
                  directly with faculty and employers.
                </p>
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-midnight/10 bg-white/80 p-4">
                  <Image
                    src="/example-badge.png"
                    alt="CNC Safety badge"
                    width={120}
                    height={140}
                    className="h-auto w-24 md:w-28"
                  />
                  <div className="text-sm text-midnight/80">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-midnight/55">
                      Issued badge · CNC Safety Foundations
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      Learners who meet the Assisted Readiness bar receive a
                      shareable digital credential that makes verification effortless for
                      employers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* CNC safety example (duplicate) */}
        <RevealOnScroll>
          <section
            id="cnc-safety-example-2"
            className="hero-pattern rounded-[32px] bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12"
          >
            <div className="grid items-start gap-10 md:grid-cols-2 xl:grid-cols-[1.25fr,0.85fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                  Extended Example · Medical Intake
                </p>
                <h3 className="text-xl font-semibold text-midnight">
                  How Vera’s AI models structure reasoning in real-world contexts
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-midnight/80">
                  <p>
                    Vera applies the same reasoning framework used in applied skills
                    assessment accross high-stakes, real-world conversations. Domain logic is encoded
                    explicitly in system design, while AI is used to interpret and shape
                    language—enabling information to be captured, organized, and evaluated against
                    domain context as interactions unfold.

                  </p>

                  <p>
                    In medical intake, this means structuring patient-reported information using the
                    Vera Medical Context Model (MCM™), which defines what information matters, how
                    elements relate, and which patterns signal risk or urgency. The system adapts
                    dynamically—filling gaps when needed, preserving uncertainty when information
                    cannot be confirmed, and surfacing clinically relevant signals in real time.
                  </p>

                  <p>
                    This approach enables Vera to operate flexibly across engagement modes. The same
                    models can listen to clinician-led encounters, assist with real-time prompts, or
                    conduct an intake interview directly—while producing consistent, structured outputs.
                    The result is a FHIR-compliant intake report that makes urgency visible early and
                    supports reliable triage, handoff, and downstream action when front-door systems
                    are under pressure.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] bg-white/90 p-6 shadow-inner ring-1 ring-midnight/10 md:mt-8 lg:mt-10">
                <dl className="grid grid-cols-2 gap-4 text-[12px] text-midnight/75">
                  {cncStatsExampleTwo.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-midnight/60">
                        {stat.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-midnight">
                        {stat.pill ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-cortex ${stat.pillBg ? "" : "bg-synapse"
                              }`}
                            style={
                              stat.pillBg || stat.pillTextColor
                                ? {
                                  ...(stat.pillBg
                                    ? { backgroundColor: stat.pillBg }
                                    : {}),
                                  ...(stat.pillTextColor
                                    ? { color: stat.pillTextColor }
                                    : {}),
                                }
                                : undefined
                            }
                          >
                            {Array.isArray(stat.value)
                              ? stat.value.join(", ")
                              : stat.value}
                          </span>
                        ) : Array.isArray(stat.value) ? (
                          <ul
                            className={`list-disc space-y-1 pl-5 ${stat.highlight ? "text-synapse font-semibold" : ""
                              }`}
                          >
                            {stat.value.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span
                            className={
                              stat.highlight ? "text-synapse font-semibold" : ""
                            }
                          >
                            {stat.value}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs leading-relaxed text-midnight/70">
                  For medical intake, Vera uses its Medical Context Model (MCM™)—a domain-specific framework that defines what information matters, how elements relate, and which patterns signal clinical risk or urgency.
                </p>
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-midnight/10 bg-white/80 p-4">
                  <Image
                    src="/example-intake3.png"
                    alt="CNC Safety badge"
                    width={120}
                    height={140}
                    className="h-auto w-24 md:w-28"
                  />
                  <div className="text-sm text-midnight/80">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-midnight/55">
                      Intake report
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      Vera Intake delivers a structured clinical summary that accelerates triage and downstream action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </div>
    </main>
  );
}
