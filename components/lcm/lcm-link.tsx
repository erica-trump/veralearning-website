"use client";

import { useState } from "react";
import LCMModal from "@/components/lcm/lcm-modal";

type Props = {
    className?: string;
};

export default function LCMLink({ className }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                    className ??
                    "inline-flex items-baseline font-semibold text-synapse underline decoration-synapse/30 underline-offset-2 transition hover:decoration-synapse/70"
                }
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                Learning Context Model™ (LCM)
            </button>

            <LCMModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}

