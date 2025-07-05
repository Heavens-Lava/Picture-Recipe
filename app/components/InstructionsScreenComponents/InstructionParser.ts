export interface ParsedInstructions {
  ingredients: string[];
  tools: string[];
  steps: string[];
}

export const parseInstructions = (instructionsText: string): ParsedInstructions => {
  if (!instructionsText) return { ingredients: [], tools: [], steps: [] };

  const lines = instructionsText.split('\n').filter(line => line.trim().length > 0);
  
  let ingredients: string[] = [];
  let tools: string[] = [];
  let steps: string[] = [];
  
  let currentSection = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Check for section headers
    if (trimmedLine.includes('**Ingredients:**') || trimmedLine.toLowerCase().includes('ingredients:')) {
      currentSection = 'ingredients';
      return;
    }
    if (trimmedLine.includes('**Tools Needed:**') || trimmedLine.toLowerCase().includes('tools needed:')) {
      currentSection = 'tools';
      return;
    }
    if (trimmedLine.includes('**Instructions:**') || trimmedLine.toLowerCase().includes('instructions:')) {
      currentSection = 'instructions';
      return;
    }
    
    // Add content to appropriate section
    if (currentSection === 'ingredients' && trimmedLine.startsWith('-')) {
      ingredients.push(trimmedLine.substring(1).trim());
    } else if (currentSection === 'tools' && trimmedLine.startsWith('-')) {
      tools.push(trimmedLine.substring(1).trim());
    } else if (currentSection === 'instructions' && (trimmedLine.match(/^\d+\./) || trimmedLine.startsWith('-'))) {
      steps.push(trimmedLine);
    } else if (!currentSection && trimmedLine) {
      // If no sections found, treat as steps
      steps.push(trimmedLine);
    }
  });
  
  return { ingredients, tools, steps };
};