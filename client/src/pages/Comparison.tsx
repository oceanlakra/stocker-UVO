import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimilarPattern {
  pattern_id: string;
  ticker: string;
  start_date: string;
  end_date: string;
  similarity_score: number;
  pattern_data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  next_day_performance: number;
}

export function Comparison() {
  const [ticker, setTicker] = useState('');
  const [startTime, setStartTime] = useState('09:15');
  const [endTime, setEndTime] = useState('09:45');
  const [numResults, setNumResults] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.9);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimilarPattern[]>([]);

  // You can add this utility function
  function isTokenExpired(token: string | null) {
    if (!token) return true;
    
    try {
      // Log the token to see what we're working with (remove in production)
      console.log('Token being checked:', token.substring(0, 20) + '...');
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token does not appear to be in JWT format');
        return false; // Let the API validate instead
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      try {
        const payload = JSON.parse(window.atob(base64));
        console.log('Token payload:', payload);
        
        // Check if exp exists and if it's valid
        if (!payload.exp) {
          console.warn('No expiration found in token');
          return false; // Let the API validate instead
        }
        
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        console.log('Token expires at:', new Date(expirationTime).toLocaleString());
        console.log('Current time:', new Date(currentTime).toLocaleString());
        
        return expirationTime < currentTime;
      } catch (parseError) {
        console.error('Error parsing token payload:', parseError);
        return false; // Let the API validate instead
      }
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return false; // Let the API validate instead
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check token existence but let the API handle validity
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to use this feature');
      return;
    }
    
    // Optional: Uncomment if you want to keep client-side expiration check
    // if (isTokenExpired(token)) {
    //   setError('Your session has expired. Please log in again.');
    //   return;
    // }

    if (!ticker) {
      setError('Please enter a ticker symbol');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Include more detailed logging for troubleshooting
      console.log('Sending request with payload:', {
        stock_symbol: ticker.toUpperCase(),
        start_time: startTime,
        end_time: endTime,
        num_results: numResults,
        similarity_threshold: similarityThreshold
      });
      
      // Use the token directly without client-side validation
      const response = await axios.post('http://localhost:8000/api/v1/comparison/find-similar-patterns', {
        stock_symbol: ticker.toUpperCase(),
        start_time: startTime,
        end_time: endTime,
        num_results: numResults,
        similarity_threshold: similarityThreshold
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Received response:', response.data);
      setResults(response.data.similar_patterns);
      
      // Update history API call with the new parameters
      await axios.post('http://localhost:8000/api/v1/history/add', {
        activity_type: 'comparison',
        details: {
          stock_symbol: ticker.toUpperCase(),
          start_time: startTime,
          end_time: endTime,
          num_results: numResults,
          similarity_threshold: similarityThreshold,
          timestamp: new Date().toISOString()
        }
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
    } catch (err: any) {
      console.error('API call failed:', err);
      
      // Log detailed error information
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        console.error('Response headers:', err.response.headers);
        
        // Handle specific error cases
        if (err.response.status === 401) {
          setError('Authentication failed. Please log out and log in again.');
          // You could also force a logout here:
          // localStorage.removeItem('token');
          // window.location.href = '/login';
        } else {
          setError(err.response.data?.detail || 'Failed to find similar patterns. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', err.message);
        setError('Error setting up the request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold tracking-tight">Pattern Comparison</h1>
        <p className="text-muted-foreground max-w-[600px] mb-8">
          Compare current market patterns with historical data to identify similar trends and potential future movements.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Configure Comparison</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Stock Symbol</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="e.g., HEROMOTOCO"
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numResults">Number of Results</Label>
              <Input
                id="numResults"
                type="number"
                value={numResults}
                onChange={(e) => setNumResults(parseInt(e.target.value) || 5)}
                placeholder="5"
                min="1"
                max="20"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Number of similar patterns to return</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="similarityThreshold">Similarity Threshold</Label>
              <Input
                id="similarityThreshold"
                type="number"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value) || 0.9)}
                step="0.05"
                min="0.5"
                max="1.0"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Minimum similarity score (0.5-1.0)</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Finding Patterns...' : 'Find Similar Patterns'}
            </Button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {results.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Similar Patterns Found</h2>
              
              {/* Chart visualization */}
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="text-sm font-medium mb-4">Historical Price Patterns</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {results.map((pattern, index) => (
                        <Line 
                          key={pattern.pattern_id}
                          type="monotone"
                          data={pattern.pattern_data}
                          dataKey="close"
                          name={`Pattern ${index + 1} (${pattern.ticker})`}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          activeDot={{ r: 8 }}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Pattern details */}
              <div className="space-y-4">
                {results.map((pattern, index) => (
                  <Card key={pattern.pattern_id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Pattern {index + 1}: {pattern.ticker}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Date Range:</div>
                        <div className="font-medium">
                          {new Date(pattern.start_date).toLocaleDateString()} - {new Date(pattern.end_date).toLocaleDateString()}
                        </div>
                        
                        <div className="text-muted-foreground">Similarity Score:</div>
                        <div className="font-medium">
                          {(pattern.similarity_score * 100).toFixed(2)}%
                        </div>
                        
                        <div className="text-muted-foreground">Next Day Performance:</div>
                        <div className={`font-medium ${pattern.next_day_performance >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {pattern.next_day_performance >= 0 ? '+' : ''}{pattern.next_day_performance.toFixed(2)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {!error && !isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center border rounded-lg p-8">
              <p className="text-muted-foreground">
                Enter a ticker symbol and configuration to find similar historical patterns.
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center border rounded-lg p-8">
              <p className="text-muted-foreground">
                Searching for similar patterns...
              </p>
              {/* You could add a spinner here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}