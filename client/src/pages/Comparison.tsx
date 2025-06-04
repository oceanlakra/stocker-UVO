import { Button } from "@/components/ui/button";

export function Comparison() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">Pattern Comparison</h1>
        <p className="text-muted-foreground max-w-[600px] mb-8">
          Compare current market patterns with historical data to identify similar trends and potential outcomes.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        <div className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold">Configure Comparison</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock Symbol</label>
              <input
                type="text"
                placeholder="e.g., AAPL"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Results</label>
              <input
                type="number"
                placeholder="5"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button className="w-full">Find Similar Patterns</Button>
          </div>
        </div>
      </div>
    </div>
  );
}