import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  ArrowRight, 
  Shield, 
  Zap,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <motion.nav 
        className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Stocker</span>
              </motion.div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Stock Analysis
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Unlock Market Insights with
              <span className="text-blue-600"> AI-Driven</span> Analysis
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Make informed investment decisions with our comprehensive stock analysis, 
              intelligent comparison tools, and accurate ML-powered predictions.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="group">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-4 w-4" />
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Investing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze, compare, and predict stock market movements
            </p>
          </motion.div>

          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Analysis Feature */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Comprehensive Analysis</CardTitle>
                  <CardDescription>
                    Deep dive into stock fundamentals, technical indicators, and market trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Financial ratios and metrics</li>
                    <li>• Technical analysis indicators</li>
                    <li>• Market sentiment analysis</li>
                    <li>• Historical performance tracking</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Comparison Feature */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Smart Comparison</CardTitle>
                  <CardDescription>
                    Compare multiple stocks side-by-side with intelligent insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Multi-stock performance comparison</li>
                    <li>• Risk-return analysis</li>
                    <li>• Sector and industry benchmarking</li>
                    <li>• Portfolio optimization suggestions</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prediction Feature */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>AI Predictions</CardTitle>
                  <CardDescription>
                    Machine learning powered forecasts and trend predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Price movement predictions</li>
                    <li>• Volatility forecasting</li>
                    <li>• Support and resistance levels</li>
                    <li>• Confidence intervals and probabilities</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">
                  Ready to Transform Your Investment Strategy?
                </CardTitle>
                <CardDescription className="text-lg">
                  Join thousands of investors making smarter decisions with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Shield className="mr-2 h-4 w-4" />
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign In to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};