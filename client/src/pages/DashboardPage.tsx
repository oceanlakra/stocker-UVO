import { PredictionCard } from "@/features/prediction/components/PredictionCard";
import { ComparisonCard } from "@/features/comparison/components/ComparisonCard";
import { RedditSentimentCard } from "@/features/analysis/components/RedditSentimentCard";

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome! Access stock analysis tools below.
        </p>
      </div>
      
      {/* Feature Cards */}
      {/* <PredictionCard /> */}
      <ComparisonCard />
      {/* <RedditSentimentCard /> */}
    </div>
  );
}