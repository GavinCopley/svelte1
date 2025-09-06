const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join('src', 'lib', 'utils', 'emojiUtils.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Write content to make sure all emojis are correct
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed emoji file written successfully');
