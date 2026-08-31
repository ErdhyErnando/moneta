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
};

type Action =
	| { type: "setRowSelection"; payload: Record<string, boolean> }
	| { type: "setColumnVisibility"; payload: VisibilityState }
	| { type: "setColumnFilters"; payload: ColumnFiltersState }
	| { type: "setSorting"; payload: SortingState };

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
	});

	return { state, dispatch };
}
