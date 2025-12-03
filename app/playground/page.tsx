import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export default function PlaygroundPage() {
    return (
        <main className="min-h-screen bg-page-bg text-midnight">
            <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
                <header>
                    <h1 className="text-2xl font-semibold">VeraLearning UI Playground</h1>
                    <p className="mt-2 text-sm text-midnight/70">
                        We use this page to test buttons, cards, layouts, and motion before
                        they move into the main site.
                    </p>
                </header>

                <section>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-midnight/60">
                        VeraLearning Button component
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-4">
                        <Button>Synapse primary</Button>
                        <Button variant="outline">Midnight outline</Button>
                        <Button variant="subtle">Cerulean subtle</Button>
                    </div>
                </section>
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-midnight/60">
                        Feature cards
                    </h2>
                    <p className="text-sm text-midnight/75 max-w-xl">
                        This is a rough grid we&apos;ll use to experiment with layout,
                        spacing, and motion before we move it into the actual homepage.
                    </p>

                    <div className="grid gap-6 md:grid-cols-3">
                        <RevealOnScroll delayMs={0}>
                            <Card>
                                <div className="text-2xl mb-3">🧠</div>
                                <h3 className="text-sm font-semibold text-midnight">
                                    Course-aware insights
                                </h3>
                                <p className="mt-2 text-xs text-midnight/75">
                                    VeraLearning understands your syllabus, assessments, and activities as a
                                    connected system, not just isolated prompts.
                                </p>
                            </Card>
                        </RevealOnScroll>

                        <RevealOnScroll delayMs={120}>
                            <Card>
                                <div className="text-2xl mb-3">📚</div>
                                <h3 className="text-sm font-semibold text-midnight">
                                    Built for real courses
                                </h3>
                                <p className="mt-2 text-xs text-midnight/75">
                                    Designed for instructors and centers for teaching, not generic
                                    content marketers or copy generators.
                                </p>
                            </Card>
                        </RevealOnScroll>

                        <RevealOnScroll delayMs={240}>
                            <Card>
                                <div className="text-2xl mb-3">🧬</div>
                                <h3 className="text-sm font-semibold text-midnight">
                                    Cognitive-science informed
                                </h3>
                                <p className="mt-2 text-xs text-midnight/75">
                                    Align structure, challenge, and support using principles from
                                    learning science and instructional design.
                                </p>
                            </Card>
                        </RevealOnScroll>
                    </div>
                </section>

            </div>
        </main>
    );
}
