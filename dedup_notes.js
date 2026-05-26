const fs = require('fs');

for (const targetFile of [
  'D:\\Med Prep\\client\\src\\pages\\flashcards\\FlashSpace.tsx',
  'D:\\Med Prep\\client\\src\\pages\\PediatricsFolder.tsx'
]) {
  let content = fs.readFileSync(targetFile, 'utf8');

  // Find the PEDIATRICS_EXPLANATIONS object boundaries
  const startMarker = 'const PEDIATRICS_EXPLANATIONS: Record<string, string> = {';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.log(`Marker not found in ${targetFile}`);
    continue;
  }

  // Find the closing brace of the object (matching the opening one)
  let braceCount = 0;
  let endIdx = -1;
  let inTemplateLiteral = false;
  let i = startIdx + startMarker.length;
  braceCount = 1; // we already passed the opening {

  while (i < content.length) {
    const ch = content[i];
    
    // Track template literals with backtick
    if (ch === '`') {
      inTemplateLiteral = !inTemplateLiteral;
    }
    
    if (!inTemplateLiteral) {
      if (ch === '{') braceCount++;
      if (ch === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    i++;
  }

  if (endIdx === -1) {
    console.log(`Could not find end of object in ${targetFile}`);
    continue;
  }

  const objText = content.substring(startIdx + startMarker.length, endIdx + 1);

  // Now parse keys. Find all key patterns like 'key': `...`, or 'key': `...`
  // We'll scan manually for unique keys
  const seen = new Set();
  const dedupedEntries = [];
  
  // We'll match each entry by finding the key pattern
  let pos = 1; // skip initial {
  const objBody = objText.slice(1, -1); // Remove { and }

  // Regex to find each key entry: 'key': `...`  (template literal values)
  // We need to handle multi-line template literals
  let objPos = 0;
  while (objPos < objBody.length) {
    // Skip whitespace
    while (objPos < objBody.length && /\s/.test(objBody[objPos])) objPos++;
    
    if (objPos >= objBody.length) break;
    
    // Match the key
    if (objBody[objPos] !== "'") {
      objPos++;
      continue;
    }
    
    // Find end of key
    let keyStart = objPos + 1;
    let keyEnd = keyStart;
    while (keyEnd < objBody.length && objBody[keyEnd] !== "'") keyEnd++;
    const key = objBody.slice(keyStart, keyEnd);
    objPos = keyEnd + 1;
    
    // Skip whitespace and colon
    while (objPos < objBody.length && /[\s:]/.test(objBody[objPos])) objPos++;
    
    // Now we should be at the value. Could be ` (template literal)
    if (objBody[objPos] !== '`') {
      objPos++;
      continue;
    }
    
    // Find the matching closing backtick (not escaped)
    let valStart = objPos;
    objPos++; // skip opening backtick
    while (objPos < objBody.length) {
      if (objBody[objPos] === '\\') { objPos += 2; continue; }
      if (objBody[objPos] === '`') { objPos++; break; }
      objPos++;
    }
    
    const entryText = `  '${key}': ${objBody.slice(valStart, objPos)}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      dedupedEntries.push(entryText);
    } else {
      console.log(`Removing duplicate key: '${key}' in ${targetFile}`);
    }
    
    // Skip trailing comma
    while (objPos < objBody.length && /[,\s]/.test(objBody[objPos])) objPos++;
  }

  // Rebuild object
  const newObj = `${startMarker}\n${dedupedEntries.join(',\n')},\n}`;
  
  const newContent = content.slice(0, startIdx) + newObj + content.slice(endIdx + 1);
  fs.writeFileSync(targetFile, newContent);
  console.log(`Done deduplicating ${targetFile}. Unique keys: ${seen.size}`);
}
