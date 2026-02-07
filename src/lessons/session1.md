# Session 1: Navigation & File System Basics

## What You'll Learn
By the end of this session, you'll understand how Unix organizes files and be able to navigate confidently through any directory structure - essential for working with engineers and understanding deployment paths.

## The Unix File System

Think of the Unix file system as an upside-down tree. The root (`/`) is at the top, and everything branches down from there. Every file and folder has a unique address called a **path**.

**Two types of paths:**
- **Absolute path**: Full address from root → `/home/user/projects/app.js`
- **Relative path**: Address from where you are → `projects/app.js` (if you're in `/home/user`)

Special shortcuts:
- `.` = current directory
- `..` = parent directory (one level up)
- `~` = your home directory

---

## Core Commands

### `pwd` - Print Working Directory
Shows where you are right now.
```bash
pwd
# Output: /home/user/projects
```

**When to use**: Lost? Always start with `pwd`.

---

### `ls` - List Contents
Shows files and folders in current directory.
```bash
ls              # Basic list
ls -l           # Detailed view (permissions, size, date)
ls -la          # Include hidden files (start with .)
ls -lh          # Human-readable file sizes
```

**When to use**: See what's in a folder before navigating or to check if files exist.

---

### `cd` - Change Directory
Move between folders.
```bash
cd projects          # Go into 'projects' folder
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
See folder hierarchy at a glance.
```bash
tree                # Show all levels
tree -L 2          # Limit to 2 levels deep
tree projects      # Show specific folder
```

**When to use**: Understand project structure quickly.

---

## Practice Exercises

Try these in the terminal:

1. **Where am I?** Run `pwd` to see your current location
2. **Explore**: Use `ls -la` to see everything in your current directory
3. **Go home**: Run `cd ~` then `pwd` to confirm you're home
4. **Navigate**: Use `cd logs` then `cd ..` to practice moving up/down
5. **Create structure**: Run `mkdir -p test/session1/practice` then `tree test` to see what you built

---

## Real-World Scenarios

**Scenario 1**: Engineer says "the logs are in `/var/logs/app`"
```bash
cd /var/logs/app
ls -lh
```

**Scenario 2**: You need to find a config file
```bash
pwd                    # Where am I?
ls -la                 # Show all files (including hidden)
cd config             # Navigate to config folder
```

---

## Key Takeaways
- Use `pwd` when lost
- Use `ls -la` to see everything (including hidden files)
- Absolute paths start with `/`, relative paths don't
- `cd ..` goes up, `cd ~` goes home

---

**Ready for Session 2? Complete these exercises first.**