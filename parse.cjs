const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf8')); 
data.forEach(f => { 
  if(f.messages.length > 0) { 
    console.log(f.filePath.replace(/\\/g, '/')); 
    f.messages.forEach(m => console.log(`  ${m.line}:${m.column} ${m.ruleId} ${m.message}`)); 
  } 
});
