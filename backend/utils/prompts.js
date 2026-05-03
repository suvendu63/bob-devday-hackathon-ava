/**
 * AI Prompt Templates for Visa Document Generation
 * Uses meta-llama/llama-3-3-70b-instruct model
 */

/**
 * Generate cover letter prompt for visa application
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {string} Formatted prompt for watsonx.ai
 */
function generateCoverLetterPrompt(traveler, requestData) {
  // Parse dates
  const [startDay, startMonth, startYear] = requestData.startDate.split('/');
  const [endDay, endMonth, endYear] = requestData.endDate.split('/');
  const startDateFormatted = `${startYear}-${startMonth}-${startDay}`;
  const endDateFormatted = `${endYear}-${endMonth}-${endDay}`;
  
  // Calculate duration
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Format interests
  const interestsText = requestData.interests && requestData.interests.length > 0
    ? requestData.interests.map(i => i.label).join(', ')
    : 'General sightseeing';
  
  // Build sponsor information
  const sponsorInfo = traveler.sponsorType === 'employer'
    ? `My trip is sponsored by my employer, ${traveler.sponsorOrg}.`
    : traveler.sponsorType === 'self'
    ? 'I am self-sponsoring this trip.'
    : `This trip is sponsored by ${traveler.sponsorOrg}.`;

  return `You are a professional visa application assistant. Generate a formal cover letter for a visa application with the following details:

Applicant Information:
- Full Name: ${traveler.name}
- Traveling from: ${requestData.fromCountry}
- Sponsor Type: ${traveler.sponsorType}
- Sponsor Organization: ${traveler.sponsorOrg || 'N/A'}

Travel Information:
- Destination Country: ${requestData.toCountry}
- Purpose: ${requestData.purpose}
- Duration: ${duration} days
- Departure Date: ${startDateFormatted}
- Return Date: ${endDateFormatted}
- Mode of Transport: ${requestData.transport || 'flight'}
- Budget: ${requestData.budget || 'Not specified'}
- Interests: ${interestsText}
${requestData.specialRequests ? `- Special Requests: ${requestData.specialRequests}` : ''}

Financial Information:
${sponsorInfo}

Requirements:
1. Use formal business letter format
2. Address to "Visa Officer" at the ${requestData.toCountry} embassy
3. Include clear statement of purpose for travel: ${requestData.purpose}
4. Mention the sponsor type and financial capability
5. Mention specific activities planned related to these interests: ${interestsText}
6. If special requests are provided, incorporate them naturally into the letter
7. Express commitment to comply with visa regulations and return home
8. Keep length between 300-500 words
9. Use professional and respectful tone
10. Include proper salutation and closing

Generate the complete cover letter now. Do not include any explanations or notes, only the letter itself.`;
}

/**
 * Generate itinerary prompt for visa application
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {string} Formatted prompt for watsonx.ai
 */
function generateItineraryPrompt(traveler, requestData) {
  // Parse dates
  const [startDay, startMonth, startYear] = requestData.startDate.split('/');
  const [endDay, endMonth, endYear] = requestData.endDate.split('/');
  const startDateFormatted = `${startYear}-${startMonth}-${startDay}`;
  const endDateFormatted = `${endYear}-${endMonth}-${endDay}`;
  
  // Calculate duration
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Format interests
  const interestsText = requestData.interests && requestData.interests.length > 0
    ? requestData.interests.map(i => i.label).join(', ')
    : 'General sightseeing';

  return `You are a professional travel planner. Generate a detailed day-by-day travel itinerary for a visa application with the following details:

Traveler Information:
- Name: ${traveler.name}
- Destination Country: ${requestData.toCountry}
- Purpose: ${requestData.purpose}
- Duration: ${duration} days
- Departure Date: ${startDateFormatted}
- Return Date: ${endDateFormatted}
- Mode of Transport: ${requestData.transport || 'flight'}
- Budget: ${requestData.budget || 'Not specified'}
- Interests: ${interestsText}
${requestData.specialRequests ? `- Special Requests: ${requestData.specialRequests}` : ''}

Requirements:
1. Create day-by-day breakdown from ${startDateFormatted} to ${endDateFormatted}
2. Include specific activities relevant to the purpose: ${requestData.purpose}
3. Plan activities that align with these interests: ${interestsText}
4. If special requests are provided, incorporate them into the itinerary
5. Consider the budget (${requestData.budget || 'moderate'}) when suggesting activities
6. Mention accommodation details for each location
7. Include transportation between locations using ${requestData.transport || 'flight'}
8. Add estimated times for major activities (morning, afternoon, evening)
9. Keep it realistic and visa-officer friendly (not overly ambitious)
10. Format with clear date headers (e.g., "Day 1 - ${startDateFormatted}")
11. Use bullet points for activities under each day
12. Include arrival and departure details with transport mode

Generate the complete itinerary now. Do not include any explanations or notes, only the itinerary itself.`;
}

/**
 * System prompt for watsonx.ai to set context
 * @returns {string} System prompt
 */
function getSystemPrompt() {
  return 'You are a professional visa documentation assistant specializing in creating formal cover letters and detailed travel itineraries for visa applications. Your responses should be professional, accurate, and formatted appropriately for official visa applications.';
}

module.exports = {
  generateCoverLetterPrompt,
  generateItineraryPrompt,
  getSystemPrompt
};

// Made with Bob
