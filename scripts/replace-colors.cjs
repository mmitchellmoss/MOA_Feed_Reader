const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'src', 'App.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'FeedCard.tsx')
];

const replacements = {
  'bg-[#f8fafc]': 'bg-bg',
  'text-[#1e293b]': 'text-text-main',
  'border-[#e2e8f0]': 'border-border',
  'text-[#64748b]': 'text-text-muted',
  'bg-white': 'bg-card',
  'text-[#0f172a]': 'text-text-main',
  'text-[#334155]': 'text-text-muted',
  'bg-[#f1f5f9]': 'bg-slate-800',
  'hover:bg-[#f1f5f9]': 'hover:bg-slate-800',
  'hover:bg-[#e2e8f0]': 'hover:bg-slate-700',
  'border-[#cbd5e1]': 'border-slate-700',
  'bg-[#e2e8f0]': 'bg-slate-700',
  'text-[#94a3b8]': 'text-slate-500',
  'bg-red-50': 'bg-red-950',
  'border-red-200': 'border-red-900',
  'text-blue-600': 'text-primary',
  'bg-blue-600': 'bg-primary'
};

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  for (const [search, replace] of Object.entries(replacements)) {
    content = content.split(search).join(replace);
  }
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
