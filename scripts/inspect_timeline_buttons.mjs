import fs from 'fs';

const content = fs.readFileSync('c:/Users/Hp/Documents/Projects/KinoBeat-Studio/src/components/Timeline/MultiTrackTimeline.tsx', 'utf8');
const lines = content.split('\n');

console.log(`MultiTrackTimeline.tsx line count: ${lines.length}`);

// Find all buttons and their onClick
lines.forEach((line, i) => {
  if (line.includes('<button')) {
    let tag = '';
    for (let j = i; j < Math.min(lines.length, i + 8); j++) {
      tag += ' ' + lines[j].trim();
      if (lines[j].includes('>')) break;
    }
    const onClickMatch = tag.match(/onClick=\{([^}]+)\}/);
    const titleMatch = tag.match(/title="([^"]+)"/);
    const textMatch = tag.match(/>([^<]+)</);
    console.log(`L${i+1}: onClick: [${onClickMatch ? onClickMatch[1] : 'NONE'}] | title: [${titleMatch ? titleMatch[1] : ''}] | snippet: ${tag.slice(0, 100)}...`);
  }
});
