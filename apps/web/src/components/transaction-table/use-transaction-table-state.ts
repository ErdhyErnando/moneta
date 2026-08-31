import type {
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

type TableState = {
	rowSelection: Record<string, boolean>;
	columnVisibility: VisibilityState;
	columnFilters: ColumnFiltersState;
	sorting: SortingState;
	pagination: { pageIndex: number; pageSize: number };
};

type Action =
	| { type: "setRowSelection"; payload: Record<string, boolean> }
	| { type: "setColumnVisibility"; payload: VisibilityState }
	| { type: "setColumnFilters"; payload: ColumnFiltersState }
	| { type: "setSorting"; payload: SortingState }
	| { type: "setPagination"; payload: { pageIndex: number; pageSize: number } };

function tableReducer(state: TableState, action: Action): TableState {
	switch (action.type) {
		case "setRowSelection":
			return { ...state, rowSelection: action.payload };
		case "setColumnVisibility":
			return { ...state, columnVisibility: action.payload };
		case "setColumnFilters":
			return { ...state, columnFilters: action.payload };
		case "setSorting":
			return { ...state, sorting: action.payload };
		case "setPagination":
			return { ...state, pagination: action.payload };
		default:
			return state;
	}
}

export function useTransactionTableState() {
	const [state, dispatch] = React.useReducer(tableReducer, {
		rowSelection: {},
		columnVisibility: {},
		columnFilters: [],
		sorting: [],
		pagination: { pageIndex: 0, pageSize: 10 },
	});

	return { state, dispatch };
}
