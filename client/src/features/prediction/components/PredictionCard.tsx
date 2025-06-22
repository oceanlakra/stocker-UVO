import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPrediction, resetPrediction } from '../predictionSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PredictionCard() {
  const [ticker, setTicker] = useState('');
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, message } = useAppSelector((state) => state.prediction);

  const handleFetchPrediction = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker) {
      dispatch(fetchPrediction(ticker.toUpperCase()));
    }
  };

  const handleReset = () => {
    dispatch(resetPrediction());
    setTicker('');
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stock Price Prediction</CardTitle>
        <CardDescription>Enter a stock ticker to forecast its future price movement.</CardDescription>
      </CardHeader>
      <CardContent>
        {!data && (
          <form onSubmit={handleFetchPrediction} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., AAPL, GOOGL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !ticker}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Predict
            </Button>
          </form>
        )}

        {isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-center mb-2">
              Prediction for {data.ticker}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {/* FIX: Use optional chaining to safely access the property. */}
              {/* This prevents a crash if the key is missing from the API response. */}
              Last actual price: ${data.last_actual_price?.toFixed(2) ?? 'N/A'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.prediction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Predicted Price']}
                  labelStyle={{ color: '#333' }}
                />
                <Legend />
                <Line type="monotone" dataKey="predicted_price" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {(data || isError) && (
           <Button variant="outline" onClick={handleReset} className="w-full">
             Start New Prediction
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}