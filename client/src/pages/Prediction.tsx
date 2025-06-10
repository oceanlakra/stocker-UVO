import { Button } from "@/components/ui/button";

export function Prediction() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">Stock Movement Prediction</h1>
        <p className="text-muted-foreground max-w-[600px] mb-8">
          Use machine learning to predict potential stock movements based on historical data and market sentiment.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        <div className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold">Configure Prediction</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock Symbol</label>
              <input
                type="text"
                placeholder="e.g., AAPL"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data History (Days)</label>
              <input
                type="number"
                placeholder="365"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sequence Length</label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Epochs</label>
                <input
                  type="number"
                  placeholder="50"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <Button className="w-full">Generate Prediction</Button>
          </div>
        </div>
      </div>
    </div>
  );
}