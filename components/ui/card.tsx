// components/ui/card.tsx
import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl bg-white border border-midnight/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6",
                className
            )}
            {...props}
        />
    );
}