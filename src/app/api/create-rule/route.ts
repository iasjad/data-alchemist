import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const getSystemPrompt = (): string => `
You are an expert rule-building assistant for a resource allocation tool. Your job is to convert a user's natural language request into a specific JSON format.

Here are the available rule types and their exact JSON structure:

1.  **Co-run Rule**: Used when certain tasks must always be scheduled together.
    -   **User says**: "make sure T1 and T5 always run together"
    -   **JSON Format**: { "type": "coRun", "tasks": ["T1", "T5"] }

**IMPORTANT RULES:**
1.  You **MUST** identify the correct rule type based on the user's intent.
2.  You **MUST** extract the necessary parameters (like Task IDs).
3.  You **MUST** respond with **ONLY** the valid JSON object. Do not include any extra text, explanations, or markdown like \`\`\`json. Your entire response should be the JSON itself.
4.  If you cannot understand the request or if it doesn't map to a known rule type, you **MUST** respond with this exact JSON error object: { "error": "Could not determine a valid rule from the request." }
`;

const cleanAndParseJson = (text: string): object => {
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Valid JSON object not found in the AI's response.");
  }

  const jsonText = text.substring(startIndex, endIndex + 1);
  return JSON.parse(jsonText);
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 500
) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    if (response.status === 503) {
      console.log(
        `Attempt ${i + 1} failed with 503. Retrying in ${backoff}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2;
    } else {
      const errorBody = await response.text();
      throw new Error(
        `API call failed with status ${response.status}: ${errorBody}`
      );
    }
  }

  throw new Error(`API call failed after ${retries} attempts.`);
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: 'Rule text is required' },
        { status: 400 }
      );
    }

    const requestBody = {
      systemInstruction: {
        parts: [{ text: getSystemPrompt() }],
      },
      contents: [
        {
          parts: [{ text: `User Request: "${text}"` }],
        },
      ],
    };

    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (
      !data.candidates ||
      data.candidates.length === 0 ||
      !data.candidates[0].content?.parts[0]?.text
    ) {
      throw new Error('API returned an invalid or empty response structure.');
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const ruleObject = cleanAndParseJson(rawText);

    return NextResponse.json(ruleObject);
  } catch (error) {
    console.error('Error in create-rule API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: 'Failed to process rule request.', details: errorMessage },
      { status: 500 }
    );
  }
}
