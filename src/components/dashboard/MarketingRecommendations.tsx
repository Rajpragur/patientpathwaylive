import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users, 
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'content' | 'strategy' | 'promotion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  timeToImplement: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export function MarketingRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'content',
      title: 'Create Video Testimonials',
      description: 'Record short video testimonials from satisfied patients to build trust and credibility.',
      priority: 'high',
      estimatedImpact: '+25% conversion rate',
      timeToImplement: '2-3 weeks',
      status: 'pending'
    },
    {
      id: '2',
      type: 'strategy',
      title: 'Optimize Quiz Sharing',
      description: 'Add social sharing buttons to quiz results to increase organic reach.',
      priority: 'medium',
      estimatedImpact: '+15% organic traffic',
      timeToImplement: '1 week',
      status: 'pending'
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Launch Email Nurture Campaign',
      description: 'Create automated email sequences for leads who haven\'t scheduled appointments.',
      priority: 'high',
      estimatedImpact: '+30% lead conversion',
      timeToImplement: '1-2 weeks',
      status: 'in-progress'
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marketing Recommendations</h1>
        <Badge variant="secondary">
          <Lightbulb className="w-4 h-4 mr-2" />
          3 New Recommendations
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {recommendation.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : recommendation.status === 'in-progress' ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
                {recommendation.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">{recommendation.description}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Impact: {recommendation.estimatedImpact}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Time: {recommendation.timeToImplement}</span>
              </div>
              <Badge variant="outline">{recommendation.type}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
