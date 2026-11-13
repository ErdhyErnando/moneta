import type * as React from "react";
import { Children, cloneElement, isValidElement } from "react";

import { cn } from "@/lib/utils";

/**
 * Minimal `asChild` implementation (the last thing Moneta used Radix's Slot
 * for). Merges className and props onto the single child element and keeps the
 * child's own handlers — exactly the behaviour the sidebar menu button needs.
 */
export function Slot({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLElement>): React.JSX.Element | null {
	const child = Children.only(children);

	if (!isValidElement(child)) {
		return null;
	}

	const childProps = child.props as { className?: string };

	return cloneElement(
		child as React.ReactElement<Record<string, unknown>>,
		{
			...props,
			className: cn(className, childProps.className),
		} as Record<string, unknown>,
	);
}
