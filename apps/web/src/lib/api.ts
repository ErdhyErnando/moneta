export const BASE_URL =
	import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Minimal AxiosError compatibility for existing `instanceof` + `error.response?.data` checks
export class AxiosError<T = unknown> extends Error {
	response?: { data: T; status: number };
	status?: number;
	constructor(message: string, response?: { data: T; status: number }) {
		super(message);
		this.name = "AxiosError";
		this.response = response;
		this.status = response?.status;
	}
}

type ApiResponse<T> = {
	data: T;
	status: number;
};

type GetConfig = {
	params?: Record<string, string | number | boolean | undefined | null>;
	headers?: Record<string, string>;
};

function buildUrl(path: string, params?: GetConfig["params"]): string {
	if (!params || Object.keys(params).length === 0) return `${BASE_URL}${path}`;
	const search = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v === undefined || v === null || v === "") continue;
		search.set(k, String(v));
	}
	const qs = search.toString();
	return qs ? `${BASE_URL}${path}?${qs}` : `${BASE_URL}${path}`;
}

async function request<T>(
	path: string,
	init: RequestInit & { params?: GetConfig["params"] } = {},
): Promise<ApiResponse<T>> {
	const { params, headers, ...rest } = init as RequestInit & {
		params?: GetConfig["params"];
		headers?: Record<string, string>;
	};
	const url = buildUrl(path, params);
	const res = await fetch(url, {
		credentials: "include",
		headers: { "Content-Type": "application/json", ...(headers ?? {}) },
		...rest,
	});

	const contentType = res.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");

	// Check status before treating the body as success: fetch() resolves
	// on HTTP 4xx/5xx, so an unchecked read can mistake an error payload
	// for a successful response.
	if (!res.ok) {
		let errorData: unknown = null;
		try {
			errorData = isJson ? await res.json() : await res.text();
		} catch {
			errorData = null;
		}
		const message =
			(errorData as { error?: { message?: string } })?.error?.message ||
			(errorData as { message?: string })?.message ||
			res.statusText ||
			"Request failed";
		throw new AxiosError(message, {
			data: errorData as T,
			status: res.status,
		});
	}

	let data: unknown = null;
	try {
		data = isJson ? await res.json() : await res.text();
	} catch {
		data = null;
	}

	return { data: data as T, status: res.status };
}

export const api = {
	get: <T>(path: string, config?: GetConfig) =>
		request<T>(path, {
			method: "GET",
			params: config?.params,
			headers: config?.headers,
		}),
	post: <T>(path: string, body?: unknown, config?: GetConfig) =>
		request<T>(path, {
			method: "POST",
			body: body !== undefined ? JSON.stringify(body) : undefined,
			params: config?.params,
			headers: config?.headers,
		}),
	put: <T>(path: string, body?: unknown, config?: GetConfig) =>
		request<T>(path, {
			method: "PUT",
			body: body !== undefined ? JSON.stringify(body) : undefined,
			params: config?.params,
			headers: config?.headers,
		}),
	delete: <T>(path: string, config?: GetConfig) =>
		request<T>(path, {
			method: "DELETE",
			params: config?.params,
			headers: config?.headers,
		}),

	// Back-compat for `api.defaults.baseURL` logging in transaction-form.tsx
	defaults: {
		baseURL: BASE_URL,
	},
};
