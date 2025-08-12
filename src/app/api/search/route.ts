import { NextRequest, NextResponse } from 'next/server';

// In a real app, this would be in a .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// The system prompt that instructs the AI
const getSystemPrompt = () => `
You are an expert data filtering assistant. Your task is to convert a user's natural language query into a structured JSON filter object.

The user can query one of three data types: 'clients', 'workers', or 'tasks'.

Based on the user's query, you must first identify the target data type. Then, create an array of filter conditions.

Each condition must have a 'field', an 'operator', and a 'value'.

Supported Operators:
- 'equals': for exact string or number matches.
- 'contains': for checking if an array includes a value.
- 'greater_than': for numbers.
- 'less_than': for numbers.

Here are the schemas for the data types:
- **clients**: { id: string, name: string, priorityLevel: number, groupTag: string }
- **workers**: { id: string, name: string, skills: string[], availableSlots: number[], maxLoadPerPhase: number, qualificationLevel: number }
- **tasks**: { id: string, name: string, category: string, duration: number, requiredSkills: string[] }

**Example Query:** "show me all tasks with a duration greater than 2 and requiring coding skill"
**Example JSON Output:**
{
  "entity": "tasks",
  "filters": [
    { "field": "duration", "operator": "greater_than", "value": 2 },
    { "field": "requiredSkills", "operator": "contains", "value": "coding" }
  ]
}

**Rules:**
1.  You MUST respond with only the JSON object. Do not include any other text, explanations, or markdown formatting.
2.  If the query is ambiguous or cannot be mapped, return an error JSON object: { "error": "Could not understand the query." }
`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // This is a basic example using the Gemini API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${getSystemPrompt()}\n\nUser Query: "${query}"` }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    // The response is nested, we need to extract the text and parse it
    const rawText = data.candidates[0].content.parts[0].text;

    // Find the first '{' and the last '}' to extract the actual JSON string
    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Valid JSON object not found in the AI's response.");
    }

    const jsonText = rawText.substring(startIndex, endIndex + 1);
    // --- END: THE FIX ---

    const filterObject = JSON.parse(jsonText); // This will now parse correctly

    return NextResponse.json(filterObject);
  } catch (error) {
    console.error('Error in search API:', error);
    // Provide a more specific error message to the frontend if possible
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: 'Failed to process search query.', details: errorMessage },
      { status: 500 }
    );
  }
}
