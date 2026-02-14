# Lesson 1: Navigation & File System Basics

## What You'll Learn
By the end of this lesson, you'll understand how Unix organizes files and be able to navigate confidently through any directory structure - essential for working with engineers and understanding deployment paths.

## The Unix File System

Think of the Unix file system as an upside-down tree. The root (`/`) is at the top, and everything branches down from there. Every file and folder has a unique address called a **path**.

**Two types of paths:**
- **Absolute path**: Full address from root → `/home/user/documents/notes.txt`
- **Relative path**: Address from where you are → `/documents/notes.txt` (if you're in `/home/user`)

Special shortcuts:
- `.` = current directory
- `..` = parent directory (one level up)
- `~` = your home directory

---
💡**Windows equivalent**: This is just like Windows File Explorer, except instead of clicking through folders visually, you're typing the path. The `C:\` drive in Windows is like Unix's `/` root.

---

**Path comparison**:
- Windows: `C:\Users\YourName\Documents\notes.txt`
- Unix: `/home/user/documents/notes.txt`

Both describe the same thing - a complete address to find your file.

---

## Core Commands

### `pwd` - Print Working Directory
Shows where you are right now.
```bash
pwd
# Output: /home/user
```

**When to use**: Lost? Always start with `pwd`.

---

### `ls` - List Contents
Shows files and folders in current directory.
```bash
ls              # Basic list
ls -l           # Detailed view (permissions, size, date)
ls -la          # Include hidden files (start with .)
ls -lh          # Human-readable file sizes. Example: -h converts 524288 bytes → 512K
```

**When to use**: See what's in a folder before navigating or to check if files exist.

---

### `cd` - Change Directory
Move between folders.
```bash
cd projects         # Go into 'projects' folder
cd ..               # Go up one level
cd /var/logs        # Jump to absolute path
cd ~                # Go home
cd                  # Also goes home (shortcut)
```

**When to use**: Navigate to where you need to work.

---

### `mkdir` - Make Directory
Create new folders.
```bash
mkdir new-project
mkdir -p projects/2024/q1    # Create nested folders
```

**When to use**: Organize your work before creating files.

---

### `tree` - Visual Directory Structure
See folder hierarchy at a glance — like a map of your project.
```bash
tree               # Show full directory tree
tree -L 2          # Limit to 2 levels deep
tree -d            # Show directories only (no files)
tree -a            # Include hidden files (dotfiles)
tree documents     # Show tree for a specific folder
```

**Useful flag combinations:**
```bash
tree -L 1         # Quick overview (just top level)
tree -da          # All directories including hidden ones
tree -L 3 -d      # Directories only, 3 levels deep
```

**Reading the output:**
```
home
├── documents        ← "├──" means more items follow
│   ├── notes.txt
│   └── plan.txt     ← "└──" means last item in this level
├── scripts
│   ├── backup.sh
│   └── hello.sh
└── downloads        ← "│" shows the vertical connection
    └── report.pdf
```

**When to use**: Understand project structure quickly — especially helpful when exploring unfamiliar codebases or verifying that files were created where you expected.

---

## Practice Exercises

Try these in the terminal:

1. **Where am I?** Run `pwd` to see your current location
2. **Explore**: Use `ls -la` to see everything in your current directory
3. **Go home**: Run `cd ~` then `pwd` to confirm you're home
4. **See the big picture**: Run `tree` from your home directory — what do you see?
5. **Limit depth**: Run `tree -L 1` to see only the top level, then `tree -L 2` to go deeper
6. **Directories only**: Run `tree -d` to see just the folder structure without files
7. **Hidden files**: Run `tree -a` — notice the dotfiles (`.bashrc`, `.profile`) that appear
8. **Specific folder**: Run `tree scripts` to see what's inside the scripts folder
9. **Navigate**: Now that you have the overall tree us `cd ..` to practice moving up/down
10. **Create & verify**: Run `mkdir -p test/lesson1/practice` then `tree test` to see what you built

---

## Real-World Scenarios

**Scenario 1**: Engineer says "the logs are in `/var/log`"
```bash
pwd
cd /var/log
ls -lh
```

**Scenario 2**: You need to find a config file
```bash
pwd                   # Where am I?
ls -la                # Show all files (including hidden)
cd config             # Navigate to config folder
```

**Scenario 3**: You just cloned a new project and want to understand its structure
```bash
tree -L 2              # Quick 2-level overview
tree -d                # See just the folder layout
```

---

## Key Takeaways
- Use `pwd` when lost
- Use `ls -la` to see everything (including hidden files)
- Use `tree -L 2` to quickly understand project structure
- Absolute paths start with `/`, relative paths don't
- `cd ..` goes up, `cd ~` goes home

---

**Ready for Lesson 2? Complete these exercises first.**