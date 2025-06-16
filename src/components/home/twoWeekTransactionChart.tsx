import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";

interface TransactionHistory {
  date: string;
  count: number;
}

export function TransactionHistoryChart({
  data,
}: {
  data: TransactionHistory[];
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      height: isMobile ? 150 : 100,
      style: {
        fontFamily: "Roboto, sans-serif",
      },
    },
    title: {
      text: "",
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%b %e}",
        style: {
          fontSize: "12px",
        },
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0,
      crosshair: false,
    },
    yAxis: {
      title: {
        text: "",
      },
      gridLineWidth: 0,
      labels: {
        formatter: function () {
          return this.value.toLocaleString();
        },
        style: {
          fontSize: "12px",
        },
      },
      tickAmount: 2,
    },
    tooltip: {
      formatter: function () {
        return `<b>${Highcharts.dateFormat("%Y-%m-%d", this.x)}</b><br/>
                Transactions: ${this.y?.toLocaleString() || 0}`;
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Transactions",
        type: "line",
        data: data.map((item) => ({
          x: new Date(item.date).getTime(),
          y: item.count,
        })),
        color: "#000",
        marker: {
          enabled: false,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="w-full overflow-hidden pt-2 min-w-[100px]">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
