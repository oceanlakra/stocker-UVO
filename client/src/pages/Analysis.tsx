import { Button } from "@/components/ui/button";

export function Analysis() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">Reddit Sentiment Analysis</h1>
        <p className="text-muted-foreground max-w-[600px] mb-8">
          Analyze market sentiment from Reddit discussions to gain insights into market trends and investor sentiment.
        </p>
      </div>
      
      <div className="grid gap-6 max-w-2xl mx-auto">
        <div className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold">Configure Analysis</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subreddits</label>
              <input
                type="text"
                placeholder="e.g., wallstreetbets, stocks"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Keywords</label>
              <input
                type="text"
                placeholder="e.g., AAPL, Tesla"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Days to Analyze</label>
              <input
                type="number"
                placeholder="30"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button className="w-full">Analyze Sentiment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}