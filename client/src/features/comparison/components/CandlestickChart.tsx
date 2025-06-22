import { createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { type CandlestickDataPoint } from '../comparisonService';

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  chartDate: string; // The date of the pattern, e.g., "2024-06-20"
}

export function CandlestickChart({ data, chartDate }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !Array.isArray(data) || data.length === 0) {
      return;
    }

    let chart: ReturnType<typeof createChart>;

    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#DDD' : '#333',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    
    // FIX 1: Configure the time scale to be more readable for intraday data.
    chart.timeScale().applyOptions({
      timeVisible: true, // Show the time on the bottom axis
      secondsVisible: false, // Hide the seconds part for clarity
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    // Convert string time to UNIX timestamp for the chart
    const formattedData = data
      .map(d => ({
        ...d,
        // FIX 2: Append 'Z' to the string to force UTC parsing.
        // This ensures timestamps are correct regardless of the user's browser timezone.
        time: new Date(`${chartDate}T${d.time}Z`).getTime() / 1000,
      }))
      .sort((a, b) => a.time - b.time); // Sort by timestamp

    candlestickSeries.setData(formattedData);

    // After setting data, fit the content to the view.
    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, chartDate]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">No chart data available for this pattern.</p>
      </div>
    );
  }

  return <div ref={chartContainerRef} />;
}