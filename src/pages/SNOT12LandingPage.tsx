import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function Snot12LandingPage() {
  const quizRef = useRef<HTMLDivElement>(null);

  const handleTakeQuiz = () => {
    if (quizRef.current) {
      quizRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-[#6B21A8] mb-4">
          Experiencing Persistent Nasal & Sinus Issues?
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Take Our Quick "SNOT-12 Test" to Assess Your Symptoms and Their Impact
        </p>
        <Button
          onClick={handleTakeQuiz}
          className="bg-gradient-to-r from-[#6B21A8] to-[#EC4899] text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-lg text-lg"
        >
          Take the SNOT-12 Test Now »
        </Button>
      </section>

      {/* Quiz Section */}
      <section ref={quizRef} className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">SNOT-12 Assessment</h2>
          </CardHeader>
          <CardContent>
            <iframe
              src="/quiz/snot12"
              width="100%"
              height="600px"
              frameBorder="0"
              className="rounded-lg"
              title="SNOT-12 Assessment Quiz"
            />
          </CardContent>
        </Card>
      </section>

      {/* Content Sections */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-purple-900">What Is the SNOT-12 Test?</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              The SNOT-12 (Sinonasal Outcome Test – 12) is a validated questionnaire that measures
              the severity of nasal and sinus-related symptoms, as well as their impact on your daily
              life. It’s commonly used to assess conditions like chronic rhinosinusitis.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-purple-900">Why Take the SNOT-12?</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Understanding your SNOT-12 score can help you and your healthcare provider identify the
              severity of your symptoms and track changes over time, making it easier to find the right
              treatment and improve your quality of life.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
