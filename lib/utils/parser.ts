import * as chrono from 'chrono-node';

export interface ParsedReminder {
  title: string;
  triggerAt?: Date;
}

export function parseReminderText(input: string): ParsedReminder {
  const cleanInput = input.trim();
  const results = chrono.parse(cleanInput);

  if (results.length === 0) {
    return { title: cleanInput };
  }

  // Use the first recognized date result
  const match = results[0];
  const triggerAt = match.date();

  // Extract the text leaving out the parsed date segment
  const title = cleanInput.replace(match.text, '').replace(/\s+/g, ' ').trim();

  return {
    title: title || cleanInput,
    triggerAt
  };
}
