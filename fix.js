const fs = require('fs');
const path = 'src/components/sections/catalog-section.tsx';
let data = fs.readFileSync(path, 'utf8');
data = data.split('className={cn(rtl && )}').join('className={cn(rtl && "text-right")}');
fs.writeFileSync(path, data);
console.log("Done");
