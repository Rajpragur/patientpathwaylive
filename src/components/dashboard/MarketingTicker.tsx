import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RefreshCw, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarketingTicker() {
  const [recommendations, setRecommendations] = useState<string[]>([
    "Share your NOSE assessment on Facebook to reach patients with breathing difficulties",
    "Create a blog post about sleep apnea symptoms and link to your STOP-BANG assessment",
    "Email your patient list about seasonal allergies and include your TNSS assessment link",
    "Add your hearing assessment to your Google Business profile to improve local SEO",
    "Create a short video explaining the benefits of taking the SNOT-22 assessment",
    "Partner with local allergists to promote your nasal assessments during allergy season",
    "Run a Facebook ad targeting users interested in sleep health with your sleep assessments",
    "Create a patient testimonial series featuring success stories after assessment-guided treatment"
  ]);
  const [currentRecommendation, setCurrentRecommendation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Select a recommendation based on the day of the month
    const dayOfMonth = new Date().getDate();
    const index = dayOfMonth % recommendations.length;
    setCurrentRecommendation(recommendations[index]);
  }, [recommendations]);

  const generateNewRecommendation = async () => {
    setIsGenerating(true);
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll just randomly select a different recommendation
      const currentIndex = recommendations.indexOf(currentRecommendation);
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * recommendations.length);
      } while (newIndex === currentIndex);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentRecommendation(recommendations[newIndex]);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-100 overflow-hidden">
      <div className="flex-shrink-0 bg-blue-100 rounded-full p-1.5">
        <Megaphone className="w-4 h-4 text-blue-600" />
      </div>
      
      <div className="flex-1 overflow-hidden relative h-6">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ 
            ease: "linear", 
            duration: 20,
            repeat: Infinity,
          }}
          className="whitespace-nowrap absolute"
        >
          <span className="text-sm font-medium text-blue-700">
            <Lightbulb className="w-4 h-4 inline-block mr-2 text-yellow-500" />
            Daily Marketing Tip: {currentRecommendation}
          </span>
        </motion.div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex-shrink-0 h-7 w-7 p-0 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-100"
        onClick={generateNewRecommendation}
        disabled={isGenerating}
      >
        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        <span className="sr-only">Generate new tip</span>
      </Button>
    </div>
  );
}