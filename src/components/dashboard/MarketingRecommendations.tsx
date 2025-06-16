import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Megaphone, 
  TrendingUp, 
  Lightbulb, 
  Copy, 
  CheckCircle2,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketingRecommendation {
  id: string;
  title: string;
  description: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'email' | 'general';
  type: 'content' | 'strategy' | 'promotion';
  date: string;
}

export function MarketingRecommendations() {
  const [recommendations, setRecommendations] = useState<MarketingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    // Simulate loading recommendations
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockRecommendations: MarketingRecommendation[] = [
          {
            id: '1',
            title: 'Share NOSE assessment results',
            description: 'Post about how the NOSE assessment helps patients understand their nasal obstruction symptoms before they come in for a consultation.',
            platform: 'facebook',
            type: 'content',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: '2',
            title: 'Sleep Apnea Awareness',
            description: 'Create a post about the link between nasal obstruction and sleep apnea, encouraging followers to take the STOP-BANG assessment.',
            platform: 'linkedin',
            type: 'content',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: '3',
            title: 'Email campaign for existing patients',
            description: 'Send an email to your patient list introducing the new online assessments and how they can help identify symptoms early.',
            platform: 'email',
            type: 'promotion',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: '4',
            title: 'Instagram Story feature',
            description: 'Create an Instagram story featuring a patient success story after they used your online assessment and received treatment.',
            platform: 'instagram',
            type: 'content',
            date: new Date(currentDate.getTime() + 86400000).toISOString().split('T')[0]
          },
          {
            id: '5',
            title: 'Twitter poll on symptoms',
            description: 'Run a Twitter poll asking followers which ENT symptoms they experience most frequently, then link to the relevant assessment.',
            platform: 'twitter',
            type: 'engagement',
            date: new Date(currentDate.getTime() + 86400000).toISOString().split('T')[0]
          }
        ];
        
        setRecommendations(mockRecommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [currentDate]);

  const handleCopyContent = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'email': return <Mail className="w-4 h-4 text-gray-600" />;
      default: return <Megaphone className="w-4 h-4 text-purple-600" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'instagram': return 'bg-pink-50 text-pink-600 border-pink-200';
      case 'linkedin': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'twitter': return 'bg-blue-50 text-blue-400 border-blue-200';
      case 'email': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-purple-50 text-purple-600 border-purple-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'content': return 'bg-green-50 text-green-600 border-green-200';
      case 'strategy': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'promotion': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-purple-50 text-purple-600 border-purple-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Marketing Recommendations</h2>
          <p className="text-gray-600">Personalized content ideas to boost your practice's online presence</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Today's Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations
                .filter(rec => isToday(rec.date))
                .map((recommendation) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">{recommendation.title}</h4>
                          <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{recommendation.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPlatformColor(recommendation.platform)}>
                              {getPlatformIcon(recommendation.platform)}
                              <span className="ml-1 capitalize">{recommendation.platform}</span>
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(recommendation.type)}>
                              {recommendation.type}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCopyContent(recommendation.id, recommendation.description)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {copiedId === recommendation.id ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Upcoming Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Upcoming Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations
                .filter(rec => !isToday(rec.date))
                .map((recommendation) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 hover:shadow-md transition-shadow bg-gray-50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">{recommendation.title}</h4>
                          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            {formatDate(recommendation.date)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{recommendation.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPlatformColor(recommendation.platform)}>
                              {getPlatformIcon(recommendation.platform)}
                              <span className="ml-1 capitalize">{recommendation.platform}</span>
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}