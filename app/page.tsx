import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import ContactCTA from "@/components/cta/contact-cta";


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
    title: "Evaluate learner mastery",
    description:
      "VeraLearning analyzes learner responses against defined competencies and performance criteria. Evidence is scored, traced to standards, and synthesized into a clear picture of what the learner can reliably do.",
    delay: 600,
    accentOpacity: 0.85,
    gradient:
      "linear-gradient(160deg, rgba(239,237,232,0.95), rgba(27,138,174,0.12))",
    shadow: "0 7px 18px rgba(10,35,66,0.08)",
    hoverClass: "hover:-translate-y-1",
  },
  {
    step: "Step 4",
    title: "Issue verifiable credentials",
    description:
      "VeraLearning produces defensible decisions, evidence trails, and sharable mastery reports so every stakeholder understands why it’s a yes.",
    delay: 900,
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
                Know who&apos;s truly ready.
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
                  VeraLearning uses adaptive AI interviews to reveal how people think and 
                  solve problems in authentic, real-world contexts. Beyond test scores, 
                  you gain clear insight into judgment, decision-making, and applied skills. 
                  These signals distinguish genuine readiness and understanding from test-taking ability.
                </p>
                <div className="space-y-3">
                  <p>
                    VeraLearning leverages its{" "}
                    <Link
                      href="/lcm"
                      className="font-semibold text-synapse underline decoration-synapse/30 underline-offset-2 transition hover:decoration-synapse/70"
                    >
                      Learning Context Model™ (LCM)
                    </Link>{" "}
                    to give AI the foundation it
                    needs to recognize and evaluate mastery by:
                  </p>

                  <div className="space-y-2">
                    {[
                      "Translating course materials and competencies into adaptive, dialog-based interviews",
                      "Probing reasoning and testing understanding through targeted questioning",
                      "Evaluating performance against defined criteria to build a structured evidence trail",
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
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              <div>
                <ContactCTA />
              </div>
            </div>
          </div>
        </section>

        <RevealOnScroll>
          <section
            id="flexible"
            className="hero-pattern scroll-mt-32 rounded-[32px] bg-white/88 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12"
          >
            <div className="space-y-4 text-sm text-midnight/80 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-midnight/55">
                Flexible by design
              </p>
              <h2 className="text-xl font-semibold text-midnight">
                Built to fit your programs and standards.
              </h2>

              <div className="space-y-3 leading-relaxed">
                <p>
                  VeraLearning can be white-labeled and customized to fit your programs,
                  standards, and learners. Our{" "}
                  <Link
                    href="/lcm"
                    className="font-semibold text-synapse underline decoration-synapse/30 underline-offset-2 transition hover:decoration-synapse/70"
                  >
                    Learning Context Model™ (LCM)
                  </Link>{" "}
                  aligns with existing curricula
                  and skill frameworks to ensure evaluation remains valid, consistent, and
                  explainable.
                </p>

                <p className="font-medium text-midnight/85">Designed to support contexts such as:</p>

                <div className="space-y-2">
                  {[
                    {
                      lead: "Universities and academic programs",
                      rest: "assessing reasoning and understanding beyond static exams",
                    },
                    {
                      lead: "Vocational and technical institutions",
                      rest: "validating job-ready skills",
                    },
                    {
                      lead: "Workforce and employer-led programs",
                      rest: "assessing real-world readiness",
                    },
                  ].map((item) => (
                    <div key={item.lead} className="flex items-start gap-2">
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
                      <p>
                        <span className="font-semibold text-midnight">{item.lead}</span>{" "}
                        {item.rest}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
              VeraLearning aligns with your course materials and skill maps, operationalizes
              competencies, orchestrates adaptive interviews, and evaluates mastery to
              produce transparent evidence and verifiable credentials that reflect what
              learners can actually do.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <RevealOnScroll
                  key={step.step}
                  delayMs={step.delay}
                  className="h-full"
                >
                  <div
                    className={`relative flex h-full flex-col rounded-2xl border border-midnight/8 p-4 shadow-sm transition-all duration-200 lg:min-h-[220px] ${step.hoverClass}`}
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
                      <p className="text-xs text-midnight/75 lg:text-[11px] lg:leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delayMs={900} className="h-full">
              <div className="mx-auto overflow-hidden rounded-2xl border border-midnight/10 bg-white/90 shadow-sm lg:w-[90%] xl:w-[85%]">
                <Image
                  src="/Credentialing-Diagram4.webp"
                  alt="Credentialing workflow diagram"
                  width={1920}
                  height={1080}
                  sizes="(min-width: 1024px) 960px, (min-width: 768px) 90vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </RevealOnScroll>
          </section>
        </RevealOnScroll>

        {/* CNC safety example */}
	        <RevealOnScroll>
	          <section
	            id="cnc-safety"
	            className="hero-pattern scroll-mt-32 rounded-[32px] bg-white/85 px-6 py-10 shadow-sm ring-1 ring-midnight/5 md:px-10 md:py-12"
	          >
            <div className="grid items-start gap-10 md:grid-cols-2 xl:grid-cols-[1.25fr,0.85fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-midnight/55">
                  Use case · Applied Skills Assessment
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
                    In the assessment snapshot shown, the learner demonstrates a clear understanding of the
                    purpose behind required safety steps and follows the primary operational
                    sequence correctly. Gaps appear in consistency, including occasional missed
                    confirmations, incomplete workspace checks, and rushed verification. With
                    oversight or a structured checklist, the learner can operate safely;
                    however, the evidence indicates they are not yet ready to run machines
                    independently.
                  </p>

                  <p>
                    Based on this assessment, the learner receives a shareable, verifiable digital credential issued
                    as an Open Badge 3.0 and aligned with W3C Verifiable Credentials.
                    The credential is portable across platforms and links directly to a structured evidence record
                    that documents demonstrated competencies, coverage across defined themes, and specific areas for improvement. Employers and training
                    programs can review this evidence directly to support decisions about
                    readiness, supervision, and next steps.
                  </p>
                </div>

              </div>

              <div className="mt-4 rounded-[28px] bg-white/90 p-6 shadow-inner ring-1 ring-midnight/10 md:mt-8 lg:mt-10">
                <p className="mb-4 text-[16px] font-semibold leading-[1.35] text-synapse">
                  Assessment Snapshot
                </p>
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
                  Use case · Clinical Intake
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
                <p className="mb-4 text-[16px] font-semibold leading-[1.35] text-synapse">
                  Intake Snapshot
                </p>
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
