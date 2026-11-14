/**
 * The one ECharts import for the app (docs/design.md §10).
 *
 * Only the modules the six charts actually use are registered, and this file is
 * imported exclusively from the chart modules — all of which are behind
 * `React.lazy` (#48/S maybe). ECharts must never appear in the entry chunk or the
 * login chunk; `pnpm -F web build` + a grep for `zrender` is the check.
 */
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
	BarChart,
	LineChart,
	PieChart,
	GridComponent,
	TooltipComponent,
	CanvasRenderer,
]);

/**
 * Every chart rebuilds its whole option object on each render (theme flip, new
 * data, new period), so updates replace the previous option instead of merging
 * into it — merging leaves stale axis extents and series state behind.
 */
export const REPLACE_OPTION = { notMerge: true } as const;

export { echarts };
