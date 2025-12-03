"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface RevealOnScrollProps {
    children: React.ReactNode;
    className?: string;
    delayMs?: number;
    transitionClass?: string;
    hiddenClass?: string;
    visibleClass?: string;
}

export function RevealOnScroll({
    children,
    className,
    delayMs = 0,
    transitionClass = "transform transition-all duration-700 ease-out",
    hiddenClass = "opacity-0 translate-y-10",
    visibleClass = "opacity-100 translate-y-0",
}: RevealOnScrollProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (delayMs) {
                        setTimeout(() => setVisible(true), delayMs);
                    } else {
                        setVisible(true);
                    }
                    observer.disconnect();
                }
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [delayMs]);

    return (
        <div
            ref={ref}
            className={cn(
                transitionClass,
                visible ? visibleClass : hiddenClass,
                className
            )}
        >
            {children}
        </div>
    );
}
