import * as chrono from 'chrono-node';

export interface ParsedReminder {
  title: string;
  triggerAt?: Date;
}

export async function parseReminderText(input: string, clientOffset?: number): Promise<ParsedReminder> {
  const cleanInput = input.trim();
  const serverOffset = new Date().getTimezoneOffset();
  const hasOffset = typeof clientOffset === 'number';
  const shiftMs = hasOffset ? (serverOffset - clientOffset) * 60 * 1000 : 0;

  const refDate = new Date(Date.now() + shiftMs);
  const results = chrono.parse(cleanInput, refDate);

  if (results.length === 0) {
    if (process.env.GEMINI_API_KEY) {
      try {
        const localNowStr = new Date(Date.now() + shiftMs).toISOString().replace('Z', '') + 
          (hasOffset ? (clientOffset <= 0 ? '+' : '-') + 
          Math.floor(Math.abs(clientOffset)/60).toString().padStart(2, '0') + ':' + 
          (Math.abs(clientOffset)%60).toString().padStart(2, '0') : '');

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a helper that extracts a reminder title and its trigger date/time.
The current date and time in the user's local timezone is: ${localNowStr}.

Analyze this input: "${cleanInput}"

Identify any date or time mentioned in the text (e.g., "tomorrow at 5pm", "next monday", "june 30th", "in 2 hours").
Return a JSON object with:
- "title": the reminder text with the date/time words removed or cleaned up.
- "triggerAt": the ISO 8601 string of the scheduled trigger date/time. If no date/time is mentioned, set it to null.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING' },
                    triggerAt: { type: 'STRING', description: 'ISO 8601 datetime string' },
                  },
                  required: ['title'],
                },
              },
            }),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const title = parsed.title?.trim();
            const triggerAtStr = parsed.triggerAt;
            let triggerAt: Date | undefined;
            if (triggerAtStr) {
              const parsedDate = new Date(triggerAtStr);
              if (!isNaN(parsedDate.getTime())) {
                triggerAt = parsedDate;
              }
            }
            return {
              title: title || cleanInput,
              triggerAt,
            };
          }
        }
      } catch (error) {
        console.error('Error calling Gemini API for date parsing:', error);
      }
    }

    return { title: cleanInput };
  }

  // Use the first recognized date result
  const match = results[0];
  let triggerAt = match.date();

  // Shift the parsed date back to get the correct UTC timestamp
  if (hasOffset && triggerAt) {
    triggerAt = new Date(triggerAt.getTime() - shiftMs);
  }

  // Extract the text leaving out the parsed date segment
  const title = cleanInput.replace(match.text, '').replace(/\s+/g, ' ').trim();

  return {
    title: title || cleanInput,
    triggerAt
  };
}
