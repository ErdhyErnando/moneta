import { CircleNotchIcon } from "@phosphor-icons/react";

export default function Loader(): React.JSX.Element {
	return (
		<div className="flex h-full items-center justify-center pt-8">
			<CircleNotchIcon className="animate-spin text-kumo-subtle" size={24} />
		</div>
	);
}
