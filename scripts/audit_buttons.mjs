import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src');
let totalButtons = 0;
let missingOnClick = [];
let emptyOnClick = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    if (line.includes('<button')) {
      totalButtons++;
      // check if this tag has onClick across lines until >
      let tagText = '';
      for (let j = i; j < Math.min(lines.length, i + 15); j++) {
        tagText += ' ' + lines[j];
        if (lines[j].includes('>')) break;
      }
      
      if (!tagText.includes('onClick') && !tagText.includes('type="submit"')) {
        missingOnClick.push({ file: path.relative('c:/Users/Hp/Documents/Projects/KinoBeat-Studio', f), line: i + 1, code: line.trim() });
      }
      if (tagText.includes('onClick={() => {}}') || tagText.includes('onClick={() => undefined}') || tagText.includes('onClick={noop}')) {
        emptyOnClick.push({ file: path.relative('c:/Users/Hp/Documents/Projects/KinoBeat-Studio', f), line: i + 1, code: line.trim() });
      }
    }
  });
});

console.log(`Total <button> elements found: ${totalButtons}`);
console.log(`Buttons without onClick: ${missingOnClick.length}`);
missingOnClick.forEach(m => console.log(`  - [${m.file}:${m.line}] ${m.code}`));
console.log(`Buttons with empty onClick: ${emptyOnClick.length}`);
emptyOnClick.forEach(m => console.log(`  - [${m.file}:${m.line}] ${m.code}`));
