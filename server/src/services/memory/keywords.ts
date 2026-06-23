const STOP_WORDS = new Set([
  "a","an","the","i","you","he","she","it","we","they","me","him","her","us","them",
  "my","your","his","its","our","their","mine","yours","hers","ours","theirs",
  "this","that","these","those","is","am","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","shall","should","may","might",
  "can","could","must","need","dare","ought","used","to","of","in","for","on","with",
  "at","by","from","as","into","through","during","before","after","above","below",
  "between","out","off","over","under","again","further","then","once","here","there",
  "when","where","why","how","all","each","every","both","few","more","most","some",
  "any","no","nor","not","only","own","same","so","than","too","very","just",
  "because","but","and","or","if","while","about","up","what","which","who","whom",
  "whose","whether","since","until","although","though","yet","still","else",
  "like","really","actually","basically","literally","quite","well","also",
]);

function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().split(/\s+/);
  const tokens = new Set<string>();
  for (const w of words) {
    const clean = w.replace(/[^a-z0-9']/g, "");
    if (clean.length > 2 && !STOP_WORDS.has(clean)) {
      tokens.add(clean);
    }
  }
  return tokens;
}

export function extractKeywords(text: string): string[] {
  return Array.from(tokenize(text));
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
