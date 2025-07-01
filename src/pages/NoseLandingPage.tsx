
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function NoseLandingPage() {
  const quizRef = useRef<HTMLDivElement>(null);

  const handleTakeQuiz = () => {
    if (quizRef.current) {
      quizRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-[#0E7C9D] mb-4">
          Struggling to Breathe Through Your Nose?
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction
        </p>
        <Button
          onClick={handleTakeQuiz}
          className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-lg text-lg"
        >
          Take the Nose Test Now »
        </Button>
      </section>

      {/* Quiz Section */}
      <section ref={quizRef} className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">NOSE Assessment</h2>
          </CardHeader>
          <CardContent>
            <iframe
              src="/quiz/nose"
              width="100%"
              height="600px"
              frameBorder="0"
              className="rounded-lg"
              title="NOSE Assessment Quiz"
            />
          </CardContent>
        </Card>
      </section>

      {/* Content Sections */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-blue-900">What Is Nasal Airway Obstruction?</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited—most commonly by structural causes—and can significantly degrade sleep, energy, exercise capacity, and quality of life.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-blue-900">Treatment Options</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We offer comprehensive treatment options from gentle medical management to advanced in-office procedures like VivAer and Latera.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
