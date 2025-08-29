#!/usr/bin/env node

/**
 * Test Quiz Email Automation
 * 
 * This script tests the quiz email automation function
 * Run with: node test-quiz-email.js
 */

import https from 'https';

// Configuration - Update with your Gmail address
const config = {
  supabaseUrl: 'https://drvitjhhggcywuepyncx.supabase.co',
  // You'll need to get this from your Supabase dashboard
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydml0amhoZ2djeXd1ZXB5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTc2NzMsImV4cCI6MjA2MzY3MzY3M30.R3g3sZc4O8w3ox22tQ31_RopbzAddU8o7j12BQEe35A', // 👈 Get this from Supabase Dashboard → Settings → API
  yourGmail: 'rajpragur@gmail.com',
  testData: {
    name: 'Test Patient',
    email: 'rajpragur@gmail.com',
    quiz_type: 'TNSS',
    score: 7,
    answers: [
      { question: 'Nasal congestion', answer: 'Moderate', score: 3 },
      { question: 'Runny nose', answer: 'Mild', score: 2 },
      { question: 'Sneezing', answer: 'Moderate', score: 2 }
    ],
    doctor_name: 'Dr. Smith',
    clinic_name: 'Patient Pathway Live'
  }
};

/**
 * Make HTTP request to Supabase function with proper authentication
 */
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${config.anonKey}`,
        'apikey': config.anonKey
      }
    };

    const req = https.request(url, requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test the quiz email automation
 */
async function testQuizEmail() {
  console.log('🧪 Testing Quiz Email Automation...');
  console.log(`📧 Sending email to: ${config.yourGmail}`);
  
  try {
    const url = `${config.supabaseUrl}/functions/v1/quiz-email-automation`;
    const response = await makeRequest(url, config.testData);
    
    console.log('\n✅ Quiz Email Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    if (response.data.data?.id) {
      console.log(`   Email ID: ${response.data.data.id}`);
    }
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS! Check your Gmail inbox!');
      console.log('   📧 Look for an email with subject: "🎯 Your TNSS Assessment Results"');
      console.log('   📱 Check both your inbox and spam folder');
      console.log('   ⏰ It may take a few minutes to arrive');
    } else {
      console.log('\n❌ Email sending failed');
      console.log(`   Error: ${response.data.error}`);
    }
    
    return response.data.success;
  } catch (error) {
    console.error('❌ Quiz Email Test Failed:', error.message);
    return false;
  }
}

/**
 * Test different quiz types
 */
async function testMultipleQuizzes() {
  console.log('\n🧪 Testing Multiple Quiz Types...');
  
  const quizTypes = [
    { type: 'TNSS', score: 8, name: 'High Score Patient' },
    { type: 'SNOT22', score: 45, name: 'Moderate Impact Patient' },
    { type: 'STOP', score: 2, name: 'Sleep Apnea Risk Patient' }
  ];
  
  for (const quiz of quizTypes) {
    console.log(`\n📝 Testing ${quiz.type} quiz...`);
    
    const testData = {
      ...config.testData,
      name: quiz.name,
      quiz_type: quiz.type,
      score: quiz.score
    };
    
    try {
      const url = `${config.supabaseUrl}/functions/v1/quiz-email-automation`;
      const response = await makeRequest(url, testData);
      
      if (response.data.success) {
        console.log(`   ✅ ${quiz.type} email sent successfully`);
      } else {
        console.log(`   ❌ ${quiz.type} email failed: ${response.data.error}`);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ ${quiz.type} test failed: ${error.message}`);
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Quiz Email Automation Tests...\n');
  
  // Check if anon key is configured
  if (config.anonKey === 'your-anon-key-here') {
    console.log('⚠️  IMPORTANT: You need to get your Supabase anon key!');
    console.log('\n📋 Steps to get your anon key:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/drvitjhhggcywuepyncx');
    console.log('   2. Click "Settings" → "API"');
    console.log('   3. Copy the "anon public" key');
    console.log('   4. Update the config.anonKey in this file');
    console.log('   5. Run this script again\n');
    return;
  }
  
  console.log(`📧 Target Gmail: ${config.yourGmail}`);
  console.log(`🏥 Quiz Type: ${config.testData.quiz_type}`);
  console.log(`📊 Quiz Score: ${config.testData.score}\n`);
  
  // Test single quiz email
  const success = await testQuizEmail();
  
  if (success) {
    // Test multiple quiz types
    await testMultipleQuizzes();
    
    console.log('\n🎯 Test Summary:');
    console.log('   ✅ Quiz email automation is working!');
    console.log('   📧 Check your Gmail for multiple quiz result emails');
    console.log('   🔧 You can now integrate this with your quiz system');
  } else {
    console.log('\n❌ Test Summary:');
    console.log('   Quiz email automation needs to be fixed');
    console.log('   Check the error messages above');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      console.log('\n✨ Test script completed!');
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}

export {
  testQuizEmail,
  testMultipleQuizzes,
  runTests
};
