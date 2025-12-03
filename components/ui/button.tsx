import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "outline" | "subtle";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

export function Button({
    variant = "primary",
    className,
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-midnight/40 focus-visible:ring-offset-cortex";

    const variants: Record<ButtonVariant, string> = {
        primary:
            "bg-synapse text-white hover:bg-cerulean shadow-[0_4px_16px_rgba(15,95,103,0.25)] px-6 py-2.5",
        outline:
            "border border-midnight text-midnight hover:bg-midnight/5 bg-transparent px-6 py-2.5",
        subtle:
            "bg-cerulean/10 text-midnight hover:bg-cerulean/20 px-6 py-2.5",
    };

    return (
        <button
            className={cn(base, variants[variant], className)}
            {...props}
        />
    );
}