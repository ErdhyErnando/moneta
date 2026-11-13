import {
	Accordion as AccordionPrimitive,
	type AccordionRootProps,
} from "@cloudflare/kumo/primitives/accordion";
import { CaretDownIcon } from "@phosphor-icons/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * kumo ships no styled accordion (only the Base UI primitive), so this is the
 * kumo-styled composition: hairline separators, `text-kumo-*` tokens, Phosphor
 * chevron. Same API as the previous shadcn wrapper, and Base UI keeps the
 * accessible disclosure behaviour (roving-less focus per APG, `aria-expanded`).
 */
function Accordion({
	className,
	...props
}: AccordionRootProps): React.JSX.Element {
	return <AccordionPrimitive.Root className={cn(className)} {...props} />;
}

function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>): React.JSX.Element {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn("border-kumo-hairline border-b last:border-b-0", className)}
			{...props}
		/>
	);
}

function AccordionTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>): React.JSX.Element {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className={cn(
					"group flex flex-1 items-start justify-between gap-4 rounded-lg py-4 text-left font-medium text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:pointer-events-none disabled:opacity-50",
					className,
				)}
				{...props}
			>
				{children}
				<CaretDownIcon
					className="pointer-events-none translate-y-0.5 text-kumo-subtle transition-transform duration-200 group-data-[panel-open]:rotate-180"
					size={16}
				/>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>): React.JSX.Element {
	return (
		<AccordionPrimitive.Panel
			data-slot="accordion-content"
			className="overflow-hidden text-sm data-[closed]:animate-accordion-up data-[open]:animate-accordion-down"
			{...props}
		>
			<div className={cn("pt-0 pb-4", className)}>{children}</div>
		</AccordionPrimitive.Panel>
	);
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
