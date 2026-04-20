const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'src', 'App.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'FeedCard.tsx')
];

const replacements = {
  'bg-bg': 'bg-black',
  'bg-card': 'bg-zinc-950',
  'border-border': 'border-zinc-800',
  'text-text-main': 'text-zinc-200',
  'text-text-muted': 'text-zinc-500',
  'bg-primary': 'bg-blue-600',
  'text-primary': 'text-blue-500',
  'border-primary': 'border-blue-600',
  'bg-special-bg': 'bg-zinc-900',
  'border-special-border': 'border-blue-800',
  'bg-slate-800': 'bg-zinc-900',
  'bg-slate-700': 'bg-zinc-800',
  'hover:bg-slate-800': 'hover:bg-zinc-800',
  'hover:bg-slate-700': 'hover:bg-zinc-800',
  'text-slate-500': 'text-zinc-500'
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
