import type * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * kumo ships no avatar primitive; this is the kumo-styled equivalent
 * (docs/design.md §7.2 — surfaces use `bg-kumo-tint`, text tokens).
 * Falls back to initials when the image is missing or fails to load.
 */
export function Avatar({
	className,
	...props
}: React.ComponentProps<"span">): React.JSX.Element {
	return (
		<span
			data-slot="avatar"
			className={cn(
				"relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-kumo-tint text-kumo-strong",
				className,
			)}
			{...props}
		/>
	);
}

export function AvatarImage({
	className,
	alt = "",
	...props
}: React.ComponentProps<"img">): React.JSX.Element | null {
	const [failed, setFailed] = useState(false);

	if (failed || !props.src) {
		return null;
	}

	return (
		<img
			data-slot="avatar-image"
			alt={alt}
			onError={() => setFailed(true)}
			className={cn("aspect-square size-full object-cover", className)}
			{...props}
		/>
	);
}

export function AvatarFallback({
	className,
	...props
}: React.ComponentProps<"span">): React.JSX.Element {
	return (
		<span
			data-slot="avatar-fallback"
			className={cn(
				"flex size-full items-center justify-center text-xs",
				className,
			)}
			{...props}
		/>
	);
}
