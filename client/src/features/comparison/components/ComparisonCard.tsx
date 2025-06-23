import { useState, useEffect } from 'react'; // 1. Make sure useEffect is imported
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchComparison, resetComparison } from '../comparisonSlice';
import { type ComparisonInput } from '../comparisonService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { CandlestickChart } from './CandlestickChart';

export function ComparisonCard() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, message } = useAppSelector((state) => state.comparison);
  const [formState, setFormState] = useState<ComparisonInput>({
    stock_symbol: 'HEROMOTOCO', // FIX: Default to a stock that works
    start_time: '09:30',
    end_time: '09:45', // FIX: Shorter window for testing
    num_results: 3,
    similarity_threshold: 0.90,
  });

  // FIX: Improved debugging
  useEffect(() => {
    if ((data?.similar_historical_patterns?.length ?? 0) > 0) {
      console.log("--- API Response Received ---");
      console.log("Full data:", data);
      const firstPattern = data ? data.similar_historical_patterns?.[0] : undefined;
      console.log("First pattern structure:", firstPattern);
      console.log("Full day data length:", firstPattern?.full_day_data?.length || 0);
      console.log("Window pattern data length:", firstPattern?.window_pattern_data?.length || 0);
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchComparison = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a clean input object, removing empty optional fields
    const input: ComparisonInput = { stock_symbol: formState.stock_symbol };
    if (formState.start_time) input.start_time = formState.start_time;
    if (formState.end_time) input.end_time = formState.end_time;
    if (formState.num_results) input.num_results = Number(formState.num_results);
    if (formState.similarity_threshold) input.similarity_threshold = Number(formState.similarity_threshold);
    
    dispatch(fetchComparison(input));
  };

  const handleReset = () => {
    dispatch(resetComparison());
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Intraday Pattern Comparison</CardTitle>
        <CardDescription>Find historical days with similar intraday price action to a stock's most recent trading day.</CardDescription>
      </CardHeader>
      <CardContent>
        {!data ? (
          <form onSubmit={handleFetchComparison} className="space-y-4">
            {/* ...existing form fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock_symbol">Stock Symbol</Label>
                <Input id="stock_symbol" name="stock_symbol" value={formState.stock_symbol} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="num_results">Number of Results</Label>
                <Input id="num_results" name="num_results" type="number" value={formState.num_results} onChange={handleInputChange} placeholder="e.g., 3" />
              </div>
              <div>
                <Label htmlFor="start_time">Start Time (HH:MM)</Label>
                <Input id="start_time" name="start_time" type="time" value={formState.start_time} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="end_time">End Time (HH:MM)</Label>
                <Input id="end_time" name="end_time" type="time" value={formState.end_time} onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="similarity_threshold">Similarity Threshold (0.0 to 1.0)</Label>
                <Input id="similarity_threshold" name="similarity_threshold" type="number" step="0.01" min="0" max="1" value={formState.similarity_threshold} onChange={handleInputChange} placeholder="e.g., 0.90" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading || !formState.stock_symbol} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</> : 'Find Similar Patterns'}
            </Button>
          </form>
        ) : (
          // FIX: Enhanced Results Display
          <div className="space-y-6">
            <div className="text-center p-4 mb-6 bg-muted rounded-lg">
              <h3 className="text-xl font-bold">Results for {data.query_stock_symbol}</h3>
              <p className="text-sm text-muted-foreground">
                Comparing pattern from {data.query_date} ({data.query_time_window})
              </p>
            </div>

            {data.similar_historical_patterns.length > 0 ? (
              <div className="space-y-8">
                {/* FIX: Show Today's Query Pattern */}
                {data.similar_historical_patterns[0]?.window_pattern_data && (
                  <Card className="border-primary/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">
                        Query Pattern - {data.query_stock_symbol} on {data.query_date}
                      </CardTitle>
                      <CardDescription>
                        This is the pattern we're comparing against ({data.query_time_window})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CandlestickChart 
                        data={data.similar_historical_patterns[0].window_pattern_data} 
                        title={`Query Pattern (${data.query_time_window})`}
                        isQueryPattern={true}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* FIX: Show Similar Historical Patterns */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Similar Historical Patterns</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.similar_historical_patterns.map((pattern, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg">{data.query_stock_symbol} on {pattern.date}</CardTitle>
                          <CardDescription>Similarity Score: {(pattern.similarity_score * 100).toFixed(2)}%</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <CandlestickChart 
                            data={pattern.full_day_data} 
                            title={`Full Day Chart - ${pattern.date}`}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Results Found</AlertTitle>
                <AlertDescription>{data.message || "No sufficiently similar historical patterns were found. Try relaxing the similarity threshold."}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {isError && !isLoading && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {(data || isError) && (
          <Button variant="outline" onClick={handleReset} className="w-full">
            Start New Comparison
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}