# Session 2: File Operations & Viewing Content

## What You'll Learn
Master the commands for creating, viewing, copying, moving, and deleting files - the everyday tasks you'll need when working with code, logs, and configuration files.

## Reading File Contents

### `cat` - Concatenate and Display
Show entire file contents at once.
```bash
cat app.log                    # View full file
cat file1.txt file2.txt       # View multiple files
cat package.json              # Common: check config files
```

**When to use**: Small files you want to see immediately.

**Don't use for**: Large log files (use `less` instead).

---

### `head` - First Lines
See the beginning of a file.
```bash
head app.log              # First 10 lines (default)
head -n 20 app.log        # First 20 lines
head -n 5 error.log       # First 5 lines
```

**When to use**: Check file headers, see recent log entries (if logs append at top).

---

### `tail` - Last Lines
See the end of a file.
```bash
tail app.log              # Last 10 lines (default)
tail -n 50 error.log      # Last 50 lines
tail -f app.log           # Follow mode: watch live updates
```

**When to use**: Check latest log entries, monitor active log files with `-f`.

**Pro tip**: `tail -f` is essential for debugging live applications.

---

### `less` - Paginated Viewing
View large files one screen at a time.
```bash
less large-log.txt
```

**Navigation inside less**:
- **Space** or **Page Down**: Next page
- **b** or **Page Up**: Previous page
- **/search-term**: Search forward
- **q**: Quit

**When to use**: Large files, scrolling through logs, reading documentation.

---

## Creating and Managing Files

### `touch` - Create Files
Create empty files or update timestamps.
```bash
touch newfile.txt
touch app.js index.html styles.css     # Create multiple files
```

**When to use**: Create placeholder files, update file modification time.

---

### `cp` - Copy Files
Duplicate files and directories.
```bash
cp source.txt backup.txt                    # Copy file
cp -r projects/ projects-backup/            # Copy directory (recursive)
cp config.json config.json.backup           # Common: backup before editing
```

**Important flags**:
- `-r`: Copy directories recursively
- `-i`: Interactive mode (ask before overwrite)

**When to use**: Create backups, duplicate configurations, copy templates.

---

### `mv` - Move or Rename
Move files to new locations or rename them.
```bash
mv oldname.txt newname.txt              # Rename file
mv file.txt /home/user/documents/       # Move to different directory
mv *.log logs/                          # Move multiple files
```

**When to use**: Organize files, rename files, move files between directories.

**Warning**: `mv` overwrites destination files without asking by default.

---

### `rm` - Remove Files
Delete files and directories.
```bash
rm file.txt                   # Delete single file
rm file1.txt file2.txt       # Delete multiple files
rm -r old-project/           # Delete directory and contents
rm -i *.log                  # Interactive: ask before each deletion
```

**Important flags**:
- `-r`: Recursive (for directories)
- `-i`: Interactive confirmation
- `-f`: Force (skip confirmations)

**Warning**: There's no "undo" for `rm`. Deleted files are gone permanently.

---

## Practice Exercises

Try these in the terminal:

1. **Create and view**: Run `touch test.txt`, then `cat test.txt`
2. **Add content**: Run `echo "Hello Unix" > test.txt`, then `cat test.txt`
3. **Copy**: Run `cp test.txt test-backup.txt`, then `ls` to confirm
4. **Rename**: Run `mv test.txt renamed.txt`, then `ls`
5. **Check logs**: Run `tail -n 20 /var/logs/app.log` to see recent entries
6. **Cleanup**: Run `rm renamed.txt test-backup.txt` to delete test files

---

## Real-World Scenarios

**Scenario 1**: Engineer asks "what's in the latest error log?"
```bash
cd /var/logs
tail -n 50 error.log          # See last 50 lines
less error.log                # Or browse the full file
```

**Scenario 2**: You need to backup a config file before editing
```bash
cp config/database.json config/database.json.backup
cat config/database.json      # Verify current settings
```

**Scenario 3**: Monitor live application logs during deployment
```bash
tail -f /var/logs/app.log     # Watch logs in real-time
# Press Ctrl+C to stop following
```

**Scenario 4**: Organize downloaded files
```bash
mv ~/downloads/*.pdf ~/documents/
ls ~/documents/               # Confirm files moved
```

---

## Key Takeaways
- Use `cat` for small files, `less` for large files
- `tail -f` is essential for monitoring live logs
- Always backup important files with `cp` before editing
- `rm` is permanent - there's no undo
- Use `-i` flag with `rm` and `mv` when working with important files

---

**Ready for Session 3? Complete these exercises first.**