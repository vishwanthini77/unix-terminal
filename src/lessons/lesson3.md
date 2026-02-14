# Lesson 3: Text Processing & Searching

## What You'll Learn
Learn to search for files, find text patterns, count data, and process text - critical skills for finding information quickly in logs, code, and configuration files.

## Searching for Text in Files

### `grep` - Global Regular Expression Print
Search for text patterns inside files.
```bash
grep "error" app.log                    # Find lines containing "error"
grep -i "error" app.log                 # Case-insensitive search
grep -n "TODO" app.js                   # Show line numbers
grep -r "database" /etc/config/         # Search recursively in directory
grep -v "debug" app.log                 # Show lines NOT matching pattern
```

**Important flags**:
- `-i`: Case-insensitive
- `-n`: Show line numbers
- `-r`: Recursive (search all files in directory)
- `-v`: Invert match (show non-matching lines)
- `-c`: Count matching lines

**When to use**: Find errors in logs, search for function names in code, locate configuration settings.

---

### `grep` Real-World Examples
```bash
# Find all error messages in today's logs
grep -i "error" /var/logs/app.log

# Find specific user activity
grep "user_id: 12345" /var/logs/access.log

# Count how many times a function is called
grep -c "processPayment" *.js

# Find configuration for database
grep -r "database" /etc/app/
```

---

## Finding Files

### `find` - Search for Files
Locate files by name, type, size, or modification time.
```bash
find . -name "*.js"                     # Find all JavaScript files
find /home -name "config.json"          # Find specific file
find . -type f -name "*.log"            # Find files (not directories)
find . -type d -name "tests"            # Find directories
find . -name "*.tmp" -delete            # Find and delete files
```

**Common patterns**:
- `-name "pattern"`: Search by filename
- `-type f`: Files only
- `-type d`: Directories only
- `-mtime -7`: Modified in last 7 days

**When to use**: Locate files when you don't know exact location, find all files of a certain type, cleanup old files.

---

### `find` Real-World Examples
```bash
# Find all configuration files
find /etc -name "*.conf"

# Find large log files (over 100MB)
find /var/logs -size +100M

# Find recently modified files (last 24 hours)
find . -type f -mtime -1

# Find and list all Python files in project
find . -name "*.py" -ls
```

---

## Counting and Processing Text

### `wc` - Word Count
Count lines, words, and characters in files.
```bash
wc file.txt                             # Lines, words, characters
wc -l file.txt                          # Count lines only
wc -w file.txt                          # Count words only
wc -c file.txt                          # Count characters only
```

**When to use**: Count log entries, measure file size, count code lines.

---

### `wc` Real-World Examples
```bash
# Count total error entries in log
grep "ERROR" app.log | wc -l

# Count how many files in directory
ls | wc -l

# Count lines of code in project
find . -name "*.js" | xargs wc -l
```

---

## Output and Redirection

### `echo` - Display Text
Print text to terminal or write to files.
```bash
echo "Hello World"                      # Print to screen
echo "Log entry" >> app.log             # Append to file
echo "New content" > file.txt           # Overwrite file
echo $PATH                              # Display variable value
```

**Redirection operators**:
- `>`: Overwrite file
- `>>`: Append to file
- `|`: Pipe output to another command

**When to use**: Add log entries, create simple config files, display messages.

---

## Combining Commands with Pipes

The real power comes from chaining commands together with `|` (pipe).
```bash
# Count error entries in logs
grep "ERROR" app.log | wc -l

# Find most common errors
grep "ERROR" app.log | sort | uniq -c | sort -nr

# List largest files in directory
ls -lh | sort -k5 -hr | head -10

# Find and count JavaScript files
find . -name "*.js" | wc -l

# Search for TODO comments in code
grep -rn "TODO" *.js | wc -l
```

---

## Practice Exercises

Try these in the terminal:

1. **Search logs**: Run `grep "error" /var/logs/app.log` to find errors
2. **Case-insensitive search**: Run `grep -i "warning" /var/logs/app.log`
3. **Count matches**: Run `grep -c "GET" /var/logs/app.log` to count requests
4. **Find files**: Run `find . -name "*.txt"` to locate text files
5. **Count lines**: Run `wc -l /var/logs/app.log` to see log size
6. **Combine commands**: Run `grep "user" /var/logs/app.log | wc -l`

---

## Real-World Scenarios

**Scenario 1**: Engineer says "check if we're getting database errors"
```bash
grep -i "database.*error" /var/logs/app.log
grep -i "database.*error" /var/logs/app.log | wc -l    # Count them
```

**Scenario 2**: Find all configuration files in the project
```bash
find . -name "*.config.js"
find . -name "*.json" | grep config
```

**Scenario 3**: How many API requests happened today?
```bash
grep "$(date +%Y-%m-%d)" /var/logs/access.log | wc -l
```

**Scenario 4**: Find which files contain a specific function
```bash
grep -rn "processPayment" src/
```

**Scenario 5**: Clean up old temporary files
```bash
find /tmp -name "*.tmp" -mtime +7          # Find files older than 7 days
find /tmp -name "*.tmp" -mtime +7 -delete  # Delete them
```

---

## Key Takeaways
- `grep` finds text patterns inside files
- `find` locates files by name, type, or attributes
- `wc` counts lines, words, and characters
- Pipe `|` chains commands together for powerful combinations
- Case-insensitive search with `-i` is essential for logs
- Always test `find` with `-delete` before actually deleting files

---

**Ready for Lesson 4? Complete these exercises first.**