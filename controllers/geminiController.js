const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

exports.getFormattedSolution = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      sampleInput,
      sampleOutput,
      constraints,
      language,
    } = req.body;

    const problemPrompt = `
You are an expert coding tutor. Please ONLY return a **pure JSON object** in the following format (no markdown, no extra explanation, no triple backticks):

{
  "explanation": "explain the approach",
  "solution": "provide clean, well-commented ${language} code",
  "conclusion": "summarize the approach, time/space complexity"
}

## Problem Title:
${title}

## Description:
${description}

## Difficulty:
${difficulty}

## Tags:
${tags.join(', ')}

## Sample Input:
${sampleInput}

## Sample Output:
${sampleOutput}

## Constraints:
${constraints}
`;

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: problemPrompt,
    });

    const text = result.candidates[0].content.parts[0].text;

    console.log('Raw Gemini response:', text);

    let structuredSolution;

    try {
      // Clean any accidental backticks or markdown
      const cleanedText = text
        .replace(/```json\s*([\s\S]*?)\s*```/, '$1')
        .replace(/```/, '')
        .trim();

      structuredSolution = JSON.parse(cleanedText);
    } catch (err) {
      console.warn('Failed to parse Gemini response as JSON. Returning raw text.');
      structuredSolution = { raw: text };
    }

    res.json({
      success: true,
      solution: structuredSolution,
    });

  } catch (error) {
    console.error('Error generating solution:', error.message);
    res.status(500).json({ success: false, error: 'Failed to generate solution' });
  }
};



exports.rateUserCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    const ratingPrompt = `
You are an expert code reviewer. Please analyze the following ${language} code and provide a **pure JSON object** response (no markdown, no extra explanation, no backticks).

The JSON should have:
{
  "score": "overall score from 1 to 100",
  "codeQuality": "brief assessment of code quality (readability, modularity, maintainability)",
  "timeComplexity": "estimated time complexity (e.g., O(n), O(n^2))",
  "spaceComplexity": "estimated space complexity (e.g., O(n), O(1))",
  "bugsOrIssues": "any potential bugs, issues, or edge cases",
  "scopeOfImprovement": "suggestions to improve the code"
}

Here’s the user code:
${code}
`;

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: ratingPrompt,
    });

    const text = result.candidates[0].content.parts[0].text;

    console.log('Raw Gemini rating response:', text);

    let ratingAnalysis;

    try {
      const cleanedText = text
        .replace(/```json\s*([\s\S]*?)\s*```/, '$1')
        .replace(/```/, '')
        .trim();

      ratingAnalysis = JSON.parse(cleanedText);
    } catch (err) {
      console.warn('Failed to parse Gemini rating as JSON. Returning raw text.');
      ratingAnalysis = { raw: text };
    }

    res.json({
      success: true,
      analysis: ratingAnalysis,
    });

  } catch (error) {
    console.error('Error rating code:', error.message);
    res.status(500).json({ success: false, error: 'Failed to rate code' });
  }
};