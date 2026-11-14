import { cn } from "@/lib/utils";

type LogoProps = {
	/** `sm` = sidebar, `lg` = auth screens (§11: 28px / 32px). */
	size?: "sm" | "lg";
	/** Hide the wordmark and keep only the mark (icon rail, tight spaces). */
	markOnly?: boolean;
	/** Tailwind classes for the wrapping element. */
	className?: string;
	/** Wordmark classes, e.g. to change the text size per surface. */
	wordmarkClassName?: string;
};

const MARK_SIZE = {
	sm: { className: "size-7", px: 28 },
	lg: { className: "size-8", px: 32 },
} as const;

/**
 * The Moneta lockup (§11): coin mark + wordmark.
 *
 * Both surfaces used to carry their own copy of this markup. The image is
 * decorative (`alt=""`) because the wordmark next to it is the name — a
 * screen reader should hear "Moneta" once, not twice.
 */
export function Logo({
	size = "sm",
	markOnly = false,
	className,
	wordmarkClassName,
}: LogoProps): React.JSX.Element {
	const mark = MARK_SIZE[size];

	return (
		<span className={cn("flex min-w-0 items-center gap-2", className)}>
			<img
				src="/logo.png"
				alt=""
				width={mark.px}
				height={mark.px}
				className={cn("shrink-0 rounded-md", mark.className)}
			/>
			{markOnly ? null : (
				<span
					className={cn(
						"truncate font-semibold text-kumo-strong tracking-tight",
						size === "lg" ? "text-lg" : "text-base",
						wordmarkClassName,
					)}
				>
					Moneta
				</span>
			)}
		</span>
	);
}
