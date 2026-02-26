# 🚀 Database Setup Guide: Getting Started with MySQL

Welcome! This guide is designed to help you get your local environment up and running with **MySQL** and populate your database using the files in the `/schema` folder. 

Don't worry if you've never used a database before—we'll take it one step at a time.

---

## 🛠 Step 1: Install MySQL

Before you can run any SQL files, you need the MySQL server installed on your machine.

### For Windows
1. Download the **MySQL Installer** from the [official downloads page](https://dev.mysql.com/downloads/installer/).
2. Choose the **"Developer Default"** setup type.
3. **Important:** During the "Accounts and Roles" step, you will be asked to set a **Root Password**. Write this down! You will need it to log in.

### For macOS
1. The easiest way is using [Homebrew](https://brew.sh/). Open your terminal and run:
   ```bash
   brew install mysql
   ```
2. Once installed, start the service:
   ```bash
   brew services start mysql
   ```

### For Linux (Ubuntu/Debian)

1. Run the following in your terminal:
```bash
sudo apt update
sudo apt install mysql-server

```



---

## 🔑 Step 2: Accessing the MySQL Shell

To verify everything is working, open your terminal (or Command Prompt) and type:

```bash
mysql -u root -p

```

* `-u root`: This tells MySQL you want to log in as the "root" user (the admin).
* `-p`: This tells MySQL to prompt you for the password you created during installation.

If you see `mysql>`, you're in! Type `exit` to leave the shell for now.

---

## 📂 Step 3: Running the Schema Files

The `schema/` folder contains SQL files that define the database structure. **Run them in this exact order** (each file depends on the previous one):

| Order | File | Purpose |
|-------|------|---------|
| 1 | `00_create_database.sql` | Creates the `chirper` database |
| 2 | `01_users.sql` | Users table |
| 3 | `02_tweets.sql` | Tweets and retweets |
| 4 | `03_likes.sql` | Likes |
| 5 | `04_comments.sql` | Comments (replies to tweets) |
| 6 | `05_follows.sql` | Follow relationships |
| 7 | `06_blocks.sql` | Block relationships |
| 8 | `05_auth.sql` | Logout token invalidation (blacklisted_tokens) |

**Important:** Run these from the **root of the `CS196-Database-main` folder** (the folder that contains `schema/` and this README).

### Method A: Using the Command Line (Recommended)

Run each file in order. You will be prompted for your MySQL root password after each command:

```bash
cd /path/to/CS196-Database-main
mysql -u root -p < schema/00_create_database.sql
mysql -u root -p < schema/01_users.sql
mysql -u root -p < schema/02_tweets.sql
mysql -u root -p < schema/03_likes.sql
mysql -u root -p < schema/04_comments.sql
mysql -u root -p < schema/05_follows.sql
mysql -u root -p < schema/06_blocks.sql
mysql -u root -p < schema/05_auth.sql
```

Or run them in one go (you’ll be prompted for your password once):

```bash
cd /path/to/CS196-Database-main
mysql -u root -p < <(cat schema/00_create_database.sql schema/01_users.sql schema/02_tweets.sql schema/03_likes.sql schema/04_comments.sql schema/05_follows.sql schema/06_blocks.sql schema/05_auth.sql)
```

### Method B: Inside the MySQL Shell

1. Log in: `mysql -u root -p`
2. Run each file with `source` (use the **full path** to the schema folder, or `cd` into `CS196-Database-main` first):

```sql
source /full/path/to/CS196-Database-main/schema/00_create_database.sql;
source /full/path/to/CS196-Database-main/schema/01_users.sql;
source /full/path/to/CS196-Database-main/schema/02_tweets.sql;
source /full/path/to/CS196-Database-main/schema/03_likes.sql;
source /full/path/to/CS196-Database-main/schema/04_comments.sql;
source /full/path/to/CS196-Database-main/schema/05_follows.sql;
source /full/path/to/CS196-Database-main/schema/06_blocks.sql;
source /full/path/to/CS196-Database-main/schema/05_auth.sql;
```

### After Step 3

- The database `chirper` will exist with empty tables (no seed data yet).
- Your backend app will connect to this database using the same name (`chirper`) and the credentials you configure in your environment.



---

## 🔍 Troubleshooting Tips

* **"Command not found":** If your terminal doesn't recognize `mysql`, you may need to add MySQL to your system's **PATH environment variables**.
* **Permission Denied:** On Linux/Mac, you might need to use `sudo` for certain installation steps.
* **Syntax Errors:** Ensure you are running the files in the correct order. For example, you can't add data to a table (seed) if the table hasn't been created yet (schema).

---
```
