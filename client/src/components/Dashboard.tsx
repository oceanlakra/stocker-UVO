import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  LogOut, 
  BarChart3, 
  Brain, 
  CandlestickChart as Candlestick,
  User,
  History
} from 'lucide-react';

// Import your page components
import { Analysis } from '@/pages/Analysis';
import { Prediction } from '@/pages/Prediction';
import { Comparison } from '@/pages/Comparison';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    return '?'; // Default fallback if both name and email are missing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Stocker</span>
              </motion.div>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.email}
              </span>
              <Avatar>
                <AvatarFallback>
                  {getInitials(user?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="prediction">Prediction</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Remove the Quick Stats card by deleting this Card component */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recent Activity
                  </CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    View your recent analysis and prediction activities
                  </div>
                  <Button className="w-full mt-4" variant="outline">View History</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Account Settings
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Manage your profile and account preferences
                  </div>
                  <Button className="w-full mt-4" variant="outline">Manage Account</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Learn how to use Stocker for market analysis and predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Market Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Analyze market sentiment from Reddit discussions and other sources to understand market trends.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Predictive Models</h4>
                      <p className="text-sm text-muted-foreground">
                        Use machine learning to predict market movements based on historical data and current trends.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Candlestick className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Pattern Comparison</h4>
                      <p className="text-sm text-muted-foreground">
                        Compare current market patterns with historical data to identify similar trends.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <Analysis />
          </TabsContent>
          
          {/* Prediction Tab */}
          <TabsContent value="prediction">
            <Prediction />
          </TabsContent>
          
          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Comparison />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
