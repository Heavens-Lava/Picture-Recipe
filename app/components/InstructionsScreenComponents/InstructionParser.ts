export interface ParsedInstructions {
  ingredients: string[];
  tools: string[];
  steps: string[];
}

export const parseInstructions = (instructionsText: string): ParsedInstructions => {
  if (!instructionsText) return { ingredients: [], tools: [], steps: [] };

  const lines = instructionsText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  let ingredients: string[] = [];
  let tools: string[] = [];
  let steps: string[] = [];

  let currentSection: 'ingredients' | 'tools' | 'instructions' | '' = '';

  lines.forEach(line => {
    const lower = line.toLowerCase();

    // Flexible section detection (markdown or plain text)
    if (
      lower.includes('**ingredients:**') ||
      lower.includes('### ingredients') ||
      lower.startsWith('ingredients:')
    ) {
      currentSection = 'ingredients';
      return;
    }

    if (
      lower.includes('**tools needed:**') ||
      lower.includes('### tools needed') ||
      lower.startsWith('tools needed:') ||
      lower.startsWith('tools:')
    ) {
      currentSection = 'tools';
      return;
    }

    if (
      lower.includes('**instructions:**') ||
      lower.includes('### instructions') ||
      lower.startsWith('instructions:') ||
      lower.startsWith('directions:')
    ) {
      currentSection = 'instructions';
      return;
    }

    // Add content to correct section
    if (currentSection === 'ingredients' && (line.startsWith('-') || line.startsWith('•'))) {
      ingredients.push(line.replace(/^[-•]\s*/, '').trim());
    } else if (currentSection === 'tools' && (line.startsWith('-') || line.startsWith('•'))) {
      tools.push(line.replace(/^[-•]\s*/, '').trim());
    } else if (currentSection === 'instructions' && (line.match(/^\d+\./) || line.startsWith('-'))) {
      steps.push(line.trim());
    }
  });

  // Fallback in case nothing was detected
  const noSectionsParsed = ingredients.length === 0 && tools.length === 0 && steps.length === 0;
  if (noSectionsParsed) {
    return { ingredients: [], tools: [], steps: lines };
  }

  return { ingredients, tools, steps };
};
