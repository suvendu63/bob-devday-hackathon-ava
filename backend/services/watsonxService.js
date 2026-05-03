/**
 * IBM watsonx.ai Service
 * Handles authentication and text generation using meta-llama/llama-3-3-70b-instruct
 */

require('dotenv').config();
const { generateCoverLetterPrompt, generateItineraryPrompt, getSystemPrompt } = require('../utils/prompts');

// watsonx.ai configuration
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
const WATSONX_URL = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
const MODEL_ID = 'meta-llama/llama-3-3-70b-instruct';

// IAM token cache
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get IBM Cloud IAM access token
 * @returns {Promise<string>} IAM access token
 */
async function getIAMToken() {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  try {
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: WATSONX_API_KEY
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IAM token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Cache token and expiry time
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return cachedToken;
  } catch (error) {
    console.error('Error getting IAM token:', error);
    throw new Error(`Failed to authenticate with IBM Cloud: ${error.message}`);
  }
}

/**
 * Call watsonx.ai text generation API
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} parameters - Model parameters
 * @returns {Promise<string>} Generated text
 */
async function callWatsonx(prompt, parameters = {}) {
  try {
    // Get IAM token
    const token = await getIAMToken();

    // Default parameters optimized for document generation
    const defaultParams = {
      max_new_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1
    };

    // Merge with provided parameters
    const modelParams = { ...defaultParams, ...parameters };

    // Prepare request body
    const requestBody = {
      model_id: MODEL_ID,
      input: prompt,
      parameters: modelParams,
      project_id: WATSONX_PROJECT_ID
    };

    // Call watsonx.ai API
    const response = await fetch(`${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`watsonx.ai API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract generated text
    if (data.results && data.results.length > 0) {
      return data.results[0].generated_text.trim();
    } else {
      throw new Error('No text generated from watsonx.ai');
    }
  } catch (error) {
    console.error('Error calling watsonx.ai:', error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

/**
 * Generate cover letter for visa application (new format)
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {Promise<string>} Generated cover letter text
 */
async function generateCoverLetter(traveler, requestData) {
  try {
    console.log(`Generating cover letter for ${traveler.name}...`);
    
    const prompt = generateCoverLetterPrompt(traveler, requestData);
    const coverLetter = await callWatsonx(prompt);
    
    console.log('Cover letter generated successfully');
    return coverLetter;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

/**
 * Generate travel itinerary for visa application (new format)
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {Promise<string>} Generated itinerary text
 */
async function generateItinerary(traveler, requestData) {
  try {
    console.log(`Generating itinerary for ${traveler.name}...`);
    
    const prompt = generateItineraryPrompt(traveler, requestData);
    const itinerary = await callWatsonx(prompt);
    
    console.log('Itinerary generated successfully');
    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
}

/**
 * Orchestrate visa document generation for multiple travelers (new format)
 * @param {Object} requestData - Complete request data with travelers array
 * @returns {Promise<Array<Object>>} Array of generated documents with metadata
 */
async function orchestrateVisaDocs(requestData) {
  const results = [];
  const travelers = requestData.travelers;

  for (const traveler of travelers) {
    try {
      console.log(`\nProcessing documents for ${traveler.name}...`);
      
      // Generate both documents
      const [coverLetter, itinerary] = await Promise.all([
        generateCoverLetter(traveler, requestData),
        generateItinerary(traveler, requestData)
      ]);

      results.push({
        travelerName: traveler.name,
        destination: requestData.toCountry,
        coverLetter,
        itinerary,
        status: 'success',
        generatedAt: new Date().toISOString()
      });

      console.log(`✓ Documents generated for ${traveler.name}`);
    } catch (error) {
      console.error(`✗ Failed to generate documents for ${traveler.name}:`, error.message);
      
      results.push({
        travelerName: traveler.name,
        destination: requestData.toCountry,
        status: 'error',
        error: error.message,
        generatedAt: new Date().toISOString()
      });
    }
  }

  return results;
}

module.exports = {
  getIAMToken,
  callWatsonx,
  generateCoverLetter,
  generateItinerary,
  orchestrateVisaDocs
};

// Made with Bob
