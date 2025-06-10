import { motion } from 'framer-motion';
import { logout } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
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
  User,
  Shield,
  Mail,
  Activity
} from 'lucide-react';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email[0].toUpperCase();
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
                  {getInitials(user?.full_name, user?.email || '')}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your investments and explore market insights
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="prediction">Prediction</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* User Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    {user?.full_name && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{user.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <Badge variant={user?.is_active ? "default" : "secondary"}>
                        {user?.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {user?.is_superuser && (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <Badge variant="outline">Administrator</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-xs text-muted-foreground">
                      Portfolio Value
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stocks Analyzed</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Predictions Made</span>
                        <span>0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      No recent activity. Start by analyzing your first stock!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Stock Analysis
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis of individual stocks with financial ratios, 
                    technical indicators, and market sentiment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Stock Analysis Tool</h3>
                    <p className="text-gray-600 mb-4">
                      Enter a stock symbol to get detailed analysis including financial metrics,
                      technical indicators, and performance insights.
                    </p>
                    <Button>Start Analysis</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Stock Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare multiple stocks side-by-side to make informed investment decisions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Stock Comparison Tool</h3>
                    <p className="text-gray-600 mb-4">
                      Select multiple stocks to compare their performance, ratios, 
                      and key metrics in an easy-to-understand format.
                    </p>
                    <Button>Compare Stocks</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prediction">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Predictions
                  </CardTitle>
                  <CardDescription>
                    Machine learning powered stock price predictions and trend forecasts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">AI Prediction Engine</h3>
                    <p className="text-gray-600 mb-4">
                      Get AI-powered predictions for stock price movements, volatility forecasts,
                      and trend analysis with confidence intervals.
                    </p>
                    <Button>Get Predictions</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};
