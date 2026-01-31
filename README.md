# Unix Terminal Starter - Setup Instructions

## Quick Start (5 minutes)

### Step 1: Create the project
```bash
npm create vite@latest unix-terminal -- --template react
cd unix-terminal
```

### Step 2: Install dependencies
```bash
npm install
npm install xterm xterm-addon-fit
```

### Step 3: Replace the src folder
Delete everything in the `src/` folder, then copy all files from this download into `src/`:

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── commands.js
├── fileSystem.js
└── components/
    └── Terminal.jsx
```

### Step 4: Run the dev server
```bash
npm run dev
```

Open http://localhost:5173 in your browser!

## What You Have

- **Working terminal** with xterm.js
- **3 commands**: `pwd`, `ls`, `cd`
- **Bonus commands**: `help`, `clear`
- **Simulated file system** with directories and files
- **Beautiful styling** with colored output

## Try These Commands

```bash
pwd                  # See current directory
ls                   # List files
ls -a                # Show hidden files
ls -l                # Long format
cd documents         # Change to documents
cd ..                # Go back up
cd ~                 # Go home
help                 # See all commands
clear                # Clear screen
```

## File Structure Explained

- `App.jsx` - Main app wrapper
- `Terminal.jsx` - The terminal UI component
- `commands.js` - All command implementations
- `fileSystem.js` - Simulated Unix file system

## Next Steps (Hour 2+)

1. Add more commands: `mkdir`, `touch`, `rm`
2. Add tab completion
3. Add command history (up/down arrows)
4. Deploy to Vercel
