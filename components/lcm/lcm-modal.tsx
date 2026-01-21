"use client";

import Modal from "@/components/ui/modal";
import LCMContent from "@/components/lcm/lcm-content";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function LCMModal({ open, onClose }: Props) {
    return (
        <Modal open={open} onClose={onClose} title="Learning Context Model™ (LCM)">
            <LCMContent />
        </Modal>
    );
}
