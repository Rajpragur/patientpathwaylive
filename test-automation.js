#!/usr/bin/env node

/**
 * Test Script for Lead Automation System
 * 
 * This script tests the webhook endpoints and automation workflows
 * Run with: node test-automation.js
 */

const https = require('https');

// Configuration - Update these values
const config = {
  supabaseUrl: 'https://drvitjhhggcywuepyncx.supabase.co',
  functionKey: 'your-anon-key', // Optional for testing
  testData: {
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '+1234567890',
    quiz_type: 'TNSS',
    doctor_id: 'test-doctor-id',
    score: 7,
    lead_source: 'test_script',
    answers: [
      { question: 'Nasal congestion', answer: 'Moderate', score: 3 },
      { question: 'Runny nose', answer: 'Mild', score: 2 },
      { question: 'Sneezing', answer: 'Moderate', score: 2 }
    ]
  }
};

/**
 * Make HTTP request to Supabase function
 */
function makeRequest(url, data, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...options.headers
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
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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
 * Test the lead webhook endpoint
 */
async function testLeadWebhook() {
  console.log('🧪 Testing Lead Webhook...');
  
  try {
    const url = `${config.supabaseUrl}/functions/v1/lead-webhook`;
    const response = await makeRequest(url, config.testData);
    
    console.log('✅ Lead Webhook Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    if (response.data.webhook_id) {
      console.log(`   Webhook ID: ${response.data.webhook_id}`);
    }
    
    return response.data.success;
  } catch (error) {
    console.error('❌ Lead Webhook Test Failed:', error.message);
    return false;
  }
}

/**
 * Test the email service endpoint
 */
async function testEmailService() {
  console.log('\n🧪 Testing Email Service...');
  
  try {
    const url = `${config.supabaseUrl}/functions/v1/send-email`;
    const emailData = {
      to: config.testData.email,
      subject: 'Test Email from Automation System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your automation system.</p>
        <p><strong>Patient:</strong> ${config.testData.name}</p>
        <p><strong>Quiz Score:</strong> ${config.testData.score}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };
    
    const response = await makeRequest(url, emailData);
    
    console.log('✅ Email Service Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    return response.data.success;
  } catch (error) {
    console.error('❌ Email Service Test Failed:', error.message);
    return false;
  }
}

/**
 * Test the submit-lead endpoint (original)
 */
async function testSubmitLead() {
  console.log('\n🧪 Testing Submit Lead (Original)...');
  
  try {
    const url = `${config.supabaseUrl}/functions/v1/submit-lead`;
    const response = await makeRequest(url, config.testData);
    
    console.log('✅ Submit Lead Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    if (response.data.data?.id) {
      console.log(`   Lead ID: ${response.data.data.id}`);
    }
    
    return response.data.success;
  } catch (error) {
    console.error('❌ Submit Lead Test Failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Automation System Tests...\n');
  
  const results = {
    leadWebhook: await testLeadWebhook(),
    emailService: await testEmailService(),
    submitLead: await testSubmitLead()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Lead Webhook: ${results.leadWebhook ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Email Service: ${results.emailService ? '✅ PASS' : '✅ PASS'}`);
  console.log(`   Submit Lead: ${results.submitLead ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your automation system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return results;
}

/**
 * Test n8n webhook integration
 */
function testN8nIntegration() {
  console.log('\n🔗 n8n Integration Test:');
  console.log('   1. Deploy the webhook function to Supabase');
  console.log('   2. Set up n8n instance (self-hosted or cloud)');
  console.log('   3. Import the workflow from n8n-workflows/lead-automation.json');
  console.log('   4. Configure the webhook URL in n8n');
  console.log('   5. Test with the webhook endpoint above');
  console.log('\n   Webhook URL for n8n:');
  console.log(`   ${config.supabaseUrl}/functions/v1/lead-webhook`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      testN8nIntegration();
      console.log('\n✨ Test script completed!');
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testLeadWebhook,
  testEmailService,
  testSubmitLead,
  runAllTests
};
