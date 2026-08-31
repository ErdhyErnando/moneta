import * as React from "react";

/**
 * Text-field state whose URL commit is debounced (#33).
 *
 * The local value is the source of truth while editing — no effect mirrors
 * the external value back into state (that pattern trips
 * react-doctor/no-derived-state). The owning component resets it directly
 * from its Clear action; debounced commits fire only on real edits.
 */
export function useDebouncedField(
	initial: string,
	commit: (value: string) => void,
	delayMs = 300,
): [string, (value: string) => void] {
	const [value, setValue] = React.useState(initial);
	const commitRef = React.useRef(commit);
	const skipFirst = React.useRef(true);

	React.useEffect(() => {
		commitRef.current = commit;
	}, [commit]);

	React.useEffect(() => {
		if (skipFirst.current) {
			skipFirst.current = false;
			return;
		}
		const timer = setTimeout(() => commitRef.current(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);

	return [value, setValue];
}
