# DB Sync — SQL Server → MySQL

A fast, dark-themed desktop tool for syncing a local SQL Server database to a remote MySQL server (DirectAdmin / phpMyAdmin). Supports full mirror mode, scheduled background sync, and real-time logging.

---

## Features

* **MIRROR mode** — full diff sync: INSERT new rows, UPDATE changed rows, DELETE removed rows. Makes remote an exact copy of local.
* **REPLACE mode** — truncates remote table then re-inserts all local rows. Best for initial sync.
* **INSERT IGNORE** — adds new rows only, never modifies existing data.
* **Scheduled sync** — creates a Windows Task Scheduler job to run silently at a set time every day.
* **Parallel sync** — syncs multiple tables simultaneously with configurable worker count.
* **Batch size control** — automatically reduces batch size on connection errors and retries.
* **Live log output** — real-time colored log inside the app plus a persistent `sync_log.txt` file.

---

## Requirements

### Runtime

* Windows 10 / 11
* **ODBC Driver 17 for SQL Server** (or newer) installed on the machine
  * Download: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

### Python (for running from source)

* Python 3.12 (recommended) — from https://www.python.org/downloads/
* Dependencies:
  ```
  pip install -r requirements.txt
  ```

---

## Usage

### Running from source

```bash
python mysql_sync.py
```

### Running headless (for Task Scheduler)

```bash
mysql_sync.exe --headless
```

or

```bash
python mysql_sync.py --headless
```

---

## First Launch

On first launch all connection fields will be  **blank** . You must fill in your own credentials in the **Config** tab and click **Save Configuration** before running a sync.

---

## Configuration

Configure the following in the **Config** tab:

**Local — SQL Server**

| Field       | Default                           | Description                |
| ----------- | --------------------------------- | -------------------------- |
| Host        | *(blank)*                       | SQL Server hostname or IP  |
| Port        | `1433`                          | SQL Server port            |
| User        | *(blank)*                       | SQL Server login username  |
| Password    | *(blank)*                       | SQL Server login password  |
| Database    | *(blank)*                       | Database name to sync from |
| ODBC Driver | `ODBC Driver 17 for SQL Server` | Installed ODBC driver name |

**Remote — MySQL**

| Field    | Default     | Description                 |
| -------- | ----------- | --------------------------- |
| Host     | *(blank)* | MySQL server hostname or IP |
| Port     | `3306`    | MySQL port                  |
| User     | *(blank)* | MySQL username              |
| Password | *(blank)* | MySQL password              |
| Database | *(blank)* | Target database name        |

**Sync Options**

| Field           | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| Mode            | MIRROR / REPLACE / INSERT IGNORE / INSERT                   |
| Exclude tables  | Comma-separated list of tables to skip                      |
| Parallel tables | Number of tables to sync simultaneously (recommended: 4–8) |
| Batch size      | Rows per batch insert (recommended: 500–2000)              |

Config is saved to `sync_config.json` in the same folder as the exe. No credentials are bundled — the file is only created after you save.

---

## Files

```
mysql_sync.exe        ← compiled executable
icon.ico              ← app icon (must be alongside the exe)
sync_config.json      ← created after first Save Configuration
sync_log.txt          ← created after first sync
```

> **Important:** `icon.ico` must remain in the same folder as `mysql_sync.exe`.

---

## Scheduled Sync

1. Open the **Schedule** tab
2. Set the desired sync time (HH:MM, 24-hour format)
3. Click **Create / Update Task**
4. Requires administrator privileges

The task runs `mysql_sync.exe --headless` daily at the configured time with highest privileges.

To remove the task, click **Remove Task** in the Schedule tab.

---

## How to Compile

Requires **Python 3.12 or 3.13** (official CPython from python.org, not Anaconda) and **Visual Studio Build Tools** with the "Desktop development with C++" workload installed.

### 1. Set up a clean virtual environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install nuitka
```

### 2. Compile

Open a **Developer PowerShell for VS** (from the Start Menu) and run:

```powershell
python -m nuitka mysql_sync.py `
  --onefile `
  --enable-plugin=tk-inter `
  --windows-console-mode=disable `
  --windows-icon-from-ico=icon.ico `
  --include-data-files=icon.ico=icon.ico `
  --include-package=mysql `
  --include-package=mysql.connector `
  --include-package=mysql.connector.plugins `
  --include-package-data=mysql.connector `
  --include-module=mysql.connector.plugins.mysql_native_password `
  --include-module=mysql.connector.plugins.caching_sha2_password `
  --include-module=mysql.connector.plugins.sha256_password `
  --include-module=mysql.connector.plugins.mysql_clear_password
```

### 3. Output

The compiled executable `mysql_sync.exe` will appear in the same directory. Place `icon.ico` alongside it before distributing.

### Notes

* Use **Python 3.12** with MinGW64 (no extra setup needed beyond Nuitka)
* Use **Python 3.13** with MSVC — requires Visual Studio Build Tools and running from Developer PowerShell
* Do **not** use Anaconda Python — it causes Nuitka metadata scanning errors
* `--include-data-files=icon.ico=icon.ico` ensures the icon is extracted next to the exe at runtime so the window icon loads correctly

---

## Troubleshooting

**"No module named pyodbc"** — install pyodbc in your venv: `pip install pyodbc`

**Connection failed on SQL Server** — check that ODBC Driver 17 is installed and the driver name in Config matches exactly

**SmartScreen blocks the exe** — right-click → Properties → Unblock, or distribute inside a ZIP file

**Taskbar icon not showing** — ensure `icon.ico` is in the same folder as the exe and the exe was compiled with `--windows-icon-from-ico=icon.ico`

**Tables skipped with "not in remote"** — those tables don't exist in the MySQL database; create them first or use a schema migration tool

**Config file not found** — this is normal on first launch; fill in your credentials and click Save Configuration

---

## License

Internal tool — all rights reserved.
