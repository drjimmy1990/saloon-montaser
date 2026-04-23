const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'src/components/sections');
const filesToFix = ['channels-section.tsx', 'clients-section.tsx', 'dashboard-section.tsx', 'bookings-section.tsx', 'blacklist-section.tsx'];

filesToFix.forEach(file => {
  const filePath = path.join(sectionsDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Remove all instances of "flex-row-reverse" conditionally added by rtl
  content = content.replace(/rtl && "sm:flex-row-reverse"/g, '""');
  content = content.replace(/rtl && "flex-row-reverse sm:flex-row-reverse"/g, '""');
  content = content.replace(/rtl \? "pr-4 pl-0 flex-row-reverse" : "pl-4"/g, 'rtl ? "pr-4 pl-0" : "pl-4"');
  content = content.replace(/rtl \? "justify-start flex-row-reverse" : "justify-end"/g, 'rtl ? "justify-start" : "justify-end"');
  content = content.replace(/rtl && "flex-row-reverse justify-end"/g, 'rtl && "justify-end"');
  content = content.replace(/rtl && "flex-row-reverse font-arabic"/g, 'rtl && "font-arabic"');
  content = content.replace(/rtl && "font-arabic flex-row-reverse"/g, 'rtl && "font-arabic"');
  content = content.replace(/rtl && "flex-row-reverse"/g, '""');

  // 2. Add dir={rtl ? "rtl" : "ltr"} to the root element.
  // The root element usually looks like:
  // return (
  //   <div className="space-y-6">
  // OR
  // return (
  //   <div className="space-y-4">
  
  if (file === 'channels-section.tsx') {
    content = content.replace(/return \(\s*<div className="space-y-6">/, 'return (\n    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>');
  } else if (file === 'clients-section.tsx') {
    content = content.replace(/return \(\s*<div className="space-y-6">/, 'return (\n    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>');
  } else if (file === 'dashboard-section.tsx') {
    content = content.replace(/return \(\s*<div className="flex flex-col gap-6 w-full max-w-full overflow-hidden pb-8">/, 'return (\n    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden pb-8" dir={rtl ? "rtl" : "ltr"}>');
  } else if (file === 'bookings-section.tsx') {
    content = content.replace(/return \(\s*<div className="space-y-6">/, 'return (\n    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>');
  } else if (file === 'blacklist-section.tsx') {
    content = content.replace(/return \(\s*<div className="space-y-6">/, 'return (\n    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>');
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${file}`);
});
