// Using the new generic AI template
import { aiService } from './ai-generic';

export interface ParsedInvoiceData {
  clientName: string;
  amount: number;
  description: string;
  dueDate?: string;
  confidence: number;
}

// Utility functions for proper capitalization
function capitalizeWords(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      
      // Handle common small words that should stay lowercase (except at beginning)
      const smallWords = ['for', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'a', 'an', 'the', 'of', 'with'];
      
      // Always capitalize first word, otherwise check if it's a small word
      const isFirstWord = text.toLowerCase().indexOf(word) === 0;
      if (isFirstWord || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      return word;
    })
    .join(' ');
}

function capitalizeClientName(name: string): string {
  if (!name || typeof name !== 'string') return name;
  
  return name
    .trim()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      
      // Handle common business suffixes
      const businessSuffixes = ['llc', 'inc', 'corp', 'ltd', 'co'];
      const lowerWord = word.toLowerCase();
      
      if (businessSuffixes.includes(lowerWord)) {
        return word.toUpperCase();
      }
      
      // Capitalize first letter of each word for names
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function capitalizeDescription(description: string): string {
  if (!description || typeof description !== 'string') return description;
  
  const trimmed = description.trim();
  if (trimmed.length === 0) return trimmed;
  
  // Apply title case to the entire text, then ensure first character is uppercase
  const titleCased = capitalizeWords(trimmed);
  
  // Ensure the very first character is uppercase (in case it was a small word)
  return titleCased.charAt(0).toUpperCase() + titleCased.slice(1);
}

export async function parseInvoiceDetails(input: string): Promise<ParsedInvoiceData | null> {
  if (!input.trim() || input.trim().length < 5) {
    return null;
  }

  // Use the generic AI service to extract invoice data
  const schema = {
    clientName: 'The person or company name (required)',
    amount: 'The monetary amount as a number (required, no currency symbols)',
    description: 'Description of work/services (required)',
    dueDate: 'Any mentioned due date in ISO format YYYY-MM-DD (optional, only if explicitly mentioned)',
    confidence: 'Your confidence level from 0 to 1 (1 being very confident)'
  };

  const systemPrompt = `You are an invoice data extraction assistant. Follow these rules:
    - If you can't extract clientName or amount with reasonable confidence, return null
    - Remove currency symbols from amount (convert $500 to 500)
    - If no description is clear, use "Professional services"
    - Only include dueDate if a specific date is mentioned
    - Be liberal with client names - accept first names, full names, or company names
    - Return names and descriptions in their original case - capitalization will be handled separately
    - Common amount formats: $500, 500 dollars, five hundred, etc.`;

  const aiResponse = await aiService.extract<ParsedInvoiceData>(input, schema, systemPrompt);
  const result = aiResponse.success ? aiResponse.data : null;
  
  if (!result) {
    return null;
  }

  // Validate the required fields
  if (!result.clientName || typeof result.clientName !== 'string' || result.clientName.trim().length === 0) {
    return null;
  }

  if (!result.amount || typeof result.amount !== 'number' || result.amount <= 0) {
    return null;
  }

  if (!result.description || typeof result.description !== 'string' || result.description.trim().length === 0) {
    return null;
  }

  // Apply proper capitalization to the parsed data
  return {
    clientName: capitalizeClientName(result.clientName.trim()),
    amount: Math.round(result.amount * 100) / 100, // Round to 2 decimal places
    description: capitalizeDescription(result.description.trim()),
    dueDate: result.dueDate && typeof result.dueDate === 'string' ? result.dueDate : undefined,
    confidence: typeof result.confidence === 'number' ? Math.max(0, Math.min(1, result.confidence)) : 0.5
  };
}

  