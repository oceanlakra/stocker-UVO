import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRedditSentiment, clearAnalysis } from '../analysisSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export function RedditSentimentCard() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.analysis);

  const [subreddits, setSubreddits] = useState('');
  const [keywords, setKeywords] = useState('');
  const [daysBack, setDaysBack] = useState<number>(7);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subreddits || !keywords) return;

    const input = {
      subreddits: subreddits.split(',').map(s => s.trim()),
      keywords: keywords.split(',').map(k => k.trim()),
      days_back: daysBack,
    };

    dispatch(fetchRedditSentiment(input));
  };

  const handleReset = () => {
    dispatch(clearAnalysis());
    setSubreddits('');
    setKeywords('');
    setDaysBack(7);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Reddit Sentiment Analysis</CardTitle>
        <CardDescription>
          Analyze sentiment of recent Reddit posts across multiple subreddits and keywords.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!data && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Subreddits (e.g., stocks, wallstreetbets)"
              value={subreddits}
              onChange={(e) => setSubreddits(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Keywords (e.g., Tesla, earnings)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={loading}
            />
            <Input
              type="number"
              placeholder="Days Back (e.g., 7)"
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !subreddits || !keywords}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze
            </Button>
          </form>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Analysis Summary</h3>
              <p className="text-sm text-muted-foreground">
                {data.total_posts_found} posts analyzed across {data.query_details.subreddits.length} subreddits.
              </p>
              <p className="mt-2 font-medium text-primary">
                Average Sentiment Score: {data.average_sentiment?.toFixed(3) ?? 'N/A'}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Sentiment by Subreddit</h4>
              <ul className="list-disc pl-6 text-sm mt-2">
                {Object.entries(data.sentiment_by_subreddit).map(([sub, score]) => (
                  <li key={sub}>
                    <strong>{sub}</strong>: {score.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Top Matching Posts</h4>
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm border">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="p-2 border">Subreddit</th>
                      <th className="p-2 border">Sentiment</th>
                      <th className="p-2 border">Score</th>
                      <th className="p-2 border">Time</th>
                      <th className="p-2 border text-left">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.posts.map((post, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 border">{post.subreddit}</td>
                        <td className="p-2 border">{post.sentiment_score.toFixed(2)}</td>
                        <td className="p-2 border">{post.post_score}</td>
                        <td className="p-2 border">{new Date(post.created_utc).toLocaleString()}</td>
                        <td className="p-2 border text-left">{post.cleaned_text_summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {(data || error) && (
          <Button variant="outline" onClick={handleReset} className="w-full">
            Start New Analysis
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
