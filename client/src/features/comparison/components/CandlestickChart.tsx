import Chart from 'react-apexcharts';
import { type CandlestickDataPoint } from '../comparisonService';

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  title: string;
  isQueryPattern?: boolean;
}

export function CandlestickChart({ data, title }: CandlestickChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">No chart data available for this pattern.</p>
      </div>
    );
  }

  // Format data for ApexCharts
  const chartData = data.map(d => ({
    x: new Date(d.date), // full datetime
    y: [d.open, d.high, d.low, d.close],
  })).sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

  const series = [{ data: chartData }];

  const options: ApexCharts.ApexOptions = {
    theme: {
      mode: 'dark',
    },
    chart: {
      type: 'candlestick',
      height: 300,
      toolbar: {
        show: true,
      },
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (val) => `₹${val.toFixed(0)}`
      },
    },
    tooltip: {
      shared: true,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const ohlc = w.globals.initialSeries[seriesIndex].data[dataPointIndex].y;
        return (
          `<div style="padding: 10px">
            <strong>Open:</strong> ₹${ohlc[0]}<br/>
            <strong>High:</strong> ₹${ohlc[1]}<br/>
            <strong>Low:</strong> ₹${ohlc[2]}<br/>
            <strong>Close:</strong> ₹${ohlc[3]}
          </div>`
        );
      }
    }
  };

  return (
    <div className="w-full">
      <div className="h-[300px]">
        <Chart options={options} series={series} type="candlestick" height={300} />
      </div>
    </div>
  );
}
