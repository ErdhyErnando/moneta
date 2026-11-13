import { Chart, type KumoChartOption } from "@cloudflare/kumo/components/chart";
import { LineChart } from "echarts/charts";
import {
	GridComponent,
	LegendComponent,
	TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
	LineChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	CanvasRenderer,
]);

// brand ramp, hue 156 (see docs/design.md)
const brand = "oklch(0.52 0.10 156)";

const days = Array.from({ length: 14 }, (_, i) => {
	const d = new Date(2026, 9, i + 1);
	return [d.getTime(), Math.round(120 + Math.sin(i / 2) * 60 + i * 9)];
});

const options: KumoChartOption = {
	grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
	xAxis: { type: "time", axisLabel: { show: true, hideOverlap: true } },
	yAxis: { type: "value", splitLine: { show: true } },
	tooltip: { trigger: "axis" },
	series: [
		{
			name: "Spend (brand ramp 1)",
			type: "line",
			smooth: true,
			showSymbol: false,
			lineStyle: { color: brand, width: 2 },
			areaStyle: { color: brand, opacity: 0.18 },
			data: days,
		},
	],
};

export default function SpikeKumoChart() {
	return (
		<div className="rounded-lg border p-4" data-spike-chart>
			<h3 className="mb-2 font-medium text-sm">Cash flow (kumo Chart)</h3>
			<Chart echarts={echarts} options={options} height={280} />
		</div>
	);
}
