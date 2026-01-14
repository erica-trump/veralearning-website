"use client";

import { useState } from "react";
import WaitlistModal from "@/components/waitlist/waitlist-modal";

export default function ContactCTA() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-full bg-synapse px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-synapse/90"
            >
                Ask for a demo
            </button>

            <WaitlistModal
                open={open}
                onClose={() => setOpen(false)}
                source="page_cta"
            />
        </>
    );
}
