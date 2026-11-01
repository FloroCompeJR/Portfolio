// Usage: node add-video-ids.js path/to/experiences.json
// 1) Fill VIDEO_IDS below (just the ID from https://youtu.be/<ID>)
// 2) Run the script. A .bak backup is created first.
const fs = require('fs');

const VIDEO_IDS = {
  'Fácil Tecnologias': '',
  'E-tática': '',
  'Deevo Studio': '',
  'Skydreamer': '',
  'QAT Global': '',
  'Swisscom AG': ''
};

const file = process.argv[2];
if (!file) { console.error('Usage: node add-video-ids.js <experiences.json>'); process.exit(1); }

let raw = fs.readFileSync(file, 'utf8');
fs.writeFileSync(file + '.bak', raw);

// fix the unclosed <i> tag in the Skydreamer description
raw = raw.replace('<i>TechCrunch Disrupt<i>', '<i>TechCrunch Disrupt</i>');

const data = JSON.parse(raw);
for (const exp of data) {
  const id = VIDEO_IDS[exp.companyName];
  if (id) exp.videoId = id;
  else console.warn(`No video ID for "${exp.companyName}" (will fall back to logo)`);
}
fs.writeFileSync(file, JSON.stringify(data, null, 4));
console.log('Done. Backup saved as', file + '.bak');
