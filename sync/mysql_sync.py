"""
SQL Server → MySQL Sync Tool  (Fast Edition + MIRROR mode)
Syncs LOCAL SQL Server → REMOTE MySQL (DirectAdmin/phpMyAdmin).

Sync modes:
  MIRROR        - full diff: INSERT new, UPDATE changed, DELETE removed
                  Makes remote an exact copy of local.
  REPLACE       - REPLACE INTO (upsert, no deletes)
  INSERT IGNORE - skip rows that already exist
  INSERT        - plain insert, errors on duplicates

Authentication (local SQL Server):
  SQL Server Auth  - username + password
  Windows Auth     - uses current Windows login (Trusted_Connection=yes)
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import json, os, sys, subprocess, datetime, threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import mysql.connector
import pyodbc
import decimal, datetime as dt

# Force pure-python implementation — avoids C-extension auth plugin DLL issues
USE_PURE = True

BASE_DIR    = os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else os.path.abspath(__file__))
CONFIG_FILE = "sync_config.json"
LOG_FILE    = "sync_log.txt"

DEFAULT_CONFIG = {
    "local": {
        "host":         "",
        "port":         "1433",
        "user":         "",
        "password":     "",
        "database":     "",
        "driver":       "ODBC Driver 17 for SQL Server",
        "windows_auth": False
    },
    "remote": {
        "host":     "",
        "port":     "3306",
        "user":     "",
        "password": "",
        "database": ""
    },
    "sync": {
        "mode":           "MIRROR",
        "sync_time":      "02:00",
        "include_tables": "",
        "exclude_tables": "",
        "batch_size":     500,
        "max_workers":    4
    }
}

CHUNK_SIZE = 500

# ── Config ────────────────────────────────────────────────────────────────────

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return DEFAULT_CONFIG.copy()

def save_config(cfg):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)

# ── Logging (thread-safe) ─────────────────────────────────────────────────────

_log_lock = threading.Lock()

def log(msg, widget=None):
    ts   = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    with _log_lock:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
        if widget:
            widget.configure(state="normal")
            widget.insert(tk.END, line + "\n")
            widget.see(tk.END)
            widget.configure(state="disabled")
    print(line)

# ── Connections ───────────────────────────────────────────────────────────────

def connect_sqlserver(cfg_local):
    driver          = cfg_local.get("driver", "ODBC Driver 17 for SQL Server")
    use_windows_auth = cfg_local.get("windows_auth", False)

    if use_windows_auth:
        conn_str = (
            f"DRIVER={{{driver}}};"
            f"SERVER={cfg_local['host']},{cfg_local['port']};"
            f"DATABASE={cfg_local['database']};"
            "Trusted_Connection=yes;"
            "TrustServerCertificate=yes;"
        )
    else:
        conn_str = (
            f"DRIVER={{{driver}}};"
            f"SERVER={cfg_local['host']},{cfg_local['port']};"
            f"DATABASE={cfg_local['database']};"
            f"UID={cfg_local['user']};"
            f"PWD={cfg_local['password']};"
            "TrustServerCertificate=yes;"
        )
    return pyodbc.connect(conn_str)

def connect_mysql(cfg_remote):
    return mysql.connector.connect(
        host=cfg_remote["host"],
        port=int(cfg_remote["port"]),
        user=cfg_remote["user"],
        password=cfg_remote["password"],
        database=cfg_remote["database"],
        connection_timeout=30,
        autocommit=False,
        raise_on_warnings=False,    # prevents 1062 duplicate warnings from becoming exceptions
        use_pure=USE_PURE           # forces pure Python, no C extension DLL needed
    )

# ── Schema helpers ────────────────────────────────────────────────────────────

def ss_get_tables(cursor):
    cursor.execute("""
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    """)
    return [row[0] for row in cursor.fetchall()]

def ss_get_columns(cursor, table):
    cursor.execute("""
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = ? ORDER BY ORDINAL_POSITION
    """, (table,))
    return [row[0] for row in cursor.fetchall()]

def ss_get_primary_keys(cursor, table):
    """Get primary key column names for a SQL Server table."""
    cursor.execute("""
        SELECT c.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE c
          ON c.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
         AND c.TABLE_NAME      = tc.TABLE_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
          AND tc.TABLE_NAME = ?
        ORDER BY c.COLUMN_NAME
    """, (table,))
    return [row[0] for row in cursor.fetchall()]

def my_get_columns(cursor, table):
    cursor.execute(f"SHOW COLUMNS FROM `{table}`")
    return [row[0] for row in cursor.fetchall()]

def my_get_primary_keys(cursor, table):
    """Get primary key column names for a MySQL table."""
    cursor.execute(f"SHOW KEYS FROM `{table}` WHERE Key_name = 'PRIMARY'")
    return [row[4] for row in cursor.fetchall()]

# ── Type coercion ─────────────────────────────────────────────────────────────

def coerce_val(val):
    if isinstance(val, decimal.Decimal): return float(val)
    if isinstance(val, (dt.date, dt.datetime, dt.time)): return str(val)
    if isinstance(val, bytes): return val.hex()
    if isinstance(val, bool): return int(val)
    if isinstance(val, str): return val.strip()   # strip CHAR/NCHAR padding from SQL Server
    return val

def coerce_row(row):
    return tuple(coerce_val(v) for v in row)

def normalize_pk(pk_tuple):
    """
    Normalize a PK tuple for comparison between SQL Server and MySQL.
    - Strips trailing spaces from CHAR/NCHAR padded strings
    - Normalises floats that are whole numbers to int strings (381.0 == 381)
    - Treats None consistently
    """
    out = []
    for v in pk_tuple:
        if v is None:
            out.append("__NULL__")
        elif isinstance(v, float):
            out.append(str(int(v)) if v == int(v) else f"{v:.10g}")
        elif isinstance(v, str):
            out.append(v.strip())
        else:
            out.append(str(v).strip())
    return tuple(out)

# ── MIRROR: full diff sync ────────────────────────────────────────────────────

def mirror_table(table, common_cols, pk_cols, batch_size, cfg_local, cfg_remote):
    """
    Full mirror — compares every row by PK, then:
      INSERT rows in local but not remote
      UPDATE rows in both where any column differs
      DELETE rows in remote but not local
    Returns (inserted, updated, deleted, error_msg)
    """
    try:
        lconn = connect_sqlserver(cfg_local)
        lcur  = lconn.cursor()
        rconn = connect_mysql(cfg_remote)
        rcur  = rconn.cursor()

        rcur.execute("SET FOREIGN_KEY_CHECKS=0")
        rcur.execute("SET UNIQUE_CHECKS=0")

        col_idx    = {c: i for i, c in enumerate(common_cols)}
        pk_idx     = [col_idx[p] for p in pk_cols]
        non_pk_cols= [c for c in common_cols if c not in pk_cols]
        non_pk_idx = [col_idx[c] for c in non_pk_cols]

        # ── Load local rows into dict keyed by normalized PK ─────────────────
        ss_sel = ", ".join(f"[{c}]" for c in common_cols)
        lcur.execute(f"SELECT {ss_sel} FROM [{table}]")
        local_data  = {}   # norm_pk → coerced row
        local_pkraw = {}   # norm_pk → raw pk values (for WHERE clauses)
        while True:
            rows = lcur.fetchmany(CHUNK_SIZE)
            if not rows:
                break
            for row in rows:
                c       = coerce_row(row)
                raw_pk  = tuple(c[i] for i in pk_idx)
                norm_pk = normalize_pk(raw_pk)
                local_data[norm_pk]  = c
                local_pkraw[norm_pk] = raw_pk

        # Reconnect MySQL fresh before fetching remote
        try: rconn.close()
        except: pass
        rconn = connect_mysql(cfg_remote)
        rcur  = rconn.cursor()
        rcur.execute("SET FOREIGN_KEY_CHECKS=0")
        rcur.execute("SET UNIQUE_CHECKS=0")

        my_cols_str = ", ".join(f"`{c}`" for c in common_cols)
        rcur.execute(f"SELECT {my_cols_str} FROM `{table}`")
        remote_data  = {}
        remote_pkraw = {}
        for row in rcur.fetchall():
            c       = coerce_row(row)
            raw_pk  = tuple(c[i] for i in pk_idx)
            norm_pk = normalize_pk(raw_pk)
            remote_data[norm_pk]  = c
            remote_pkraw[norm_pk] = raw_pk

        # ── Diff on normalized keys ───────────────────────────────────────────
        local_pks  = set(local_data)
        remote_pks = set(remote_data)
        to_insert  = local_pks - remote_pks
        to_delete  = remote_pks - local_pks
        to_update  = {pk for pk in (local_pks & remote_pks)
                      if local_data[pk] != remote_data[pk]}

        inserted = updated = deleted = 0

        # ── INSERT new rows ───────────────────────────────────────────────────
        if to_insert:
            ph  = ", ".join(["%s"] * len(common_cols))
            sql = f"REPLACE INTO `{table}` ({my_cols_str}) VALUES ({ph})"
            rows = [local_data[pk] for pk in to_insert]
            i = 0; cur_batch = batch_size; consec = 0
            while i < len(rows):
                try:
                    rcur.executemany(sql, rows[i:i+cur_batch])
                    rconn.commit()
                    i += cur_batch
                    consec = 0
                except Exception as be:
                    bs = str(be)
                    is_conn = any(c in bs for c in ("2013","2006","2055","10054","10053"))
                    if (is_conn or "max_allowed_packet" in bs.lower()) and cur_batch > 1:
                        consec += 1
                        cur_batch = 1 if consec >= 3 else max(1, cur_batch // 4)
                        try: rconn.close()
                        except: pass
                        import time; time.sleep(min(consec * 0.5, 3))
                        rconn = connect_mysql(cfg_remote)
                        rcur  = rconn.cursor()
                        rcur.execute("SET FOREIGN_KEY_CHECKS=0")
                        rcur.execute("SET UNIQUE_CHECKS=0")
                    else: raise
            inserted = len(to_insert)

        # ── UPDATE ────────────────────────────────────────────────────────────
        if to_update and non_pk_cols:
            set_cl   = ", ".join(f"`{c}` = %s" for c in non_pk_cols)
            where_cl = " AND ".join(f"`{p}` = %s" for p in pk_cols)
            sql = f"UPDATE `{table}` SET {set_cl} WHERE {where_cl}"
            rows = []
            for pk in to_update:
                row = local_data[pk]
                rows.append(
                    tuple(row[i] for i in non_pk_idx) +
                    remote_pkraw[pk]
                )
            i = 0; cur_batch = batch_size; consec = 0
            while i < len(rows):
                try:
                    rcur.executemany(sql, rows[i:i+cur_batch])
                    rconn.commit()
                    i += cur_batch
                    consec = 0
                except Exception as be:
                    bs = str(be)
                    is_conn = any(c in bs for c in ("2013","2006","2055","10054","10053"))
                    if (is_conn or "max_allowed_packet" in bs.lower()) and cur_batch > 1:
                        consec += 1
                        cur_batch = 1 if consec >= 3 else max(1, cur_batch // 4)
                        try: rconn.close()
                        except: pass
                        import time; time.sleep(min(consec * 0.5, 3))
                        rconn = connect_mysql(cfg_remote)
                        rcur  = rconn.cursor()
                        rcur.execute("SET FOREIGN_KEY_CHECKS=0")
                        rcur.execute("SET UNIQUE_CHECKS=0")
                    else: raise
            updated = len(to_update)

        # ── DELETE ────────────────────────────────────────────────────────────
        if to_delete:
            where_cl = " AND ".join(f"`{p}` = %s" for p in pk_cols)
            sql = f"DELETE FROM `{table}` WHERE {where_cl}"
            rows = [remote_pkraw[pk] if len(pk_cols) > 1 else (remote_pkraw[pk][0],)
                    for pk in to_delete]
            for i in range(0, len(rows), batch_size):
                rcur.executemany(sql, rows[i:i+batch_size])
            rconn.commit()
            deleted = len(to_delete)

        lconn.close()
        rconn.close()
        return inserted, updated, deleted, None

    except Exception as e:
        return 0, 0, 0, str(e)


# ── Standard sync (REPLACE / INSERT IGNORE / INSERT) ─────────────────────────

def sync_one_table(table, common_cols, mode, batch_size, cfg_local, cfg_remote):
    try:
        lconn = connect_sqlserver(cfg_local)
        lcur  = lconn.cursor()
        rconn = connect_mysql(cfg_remote)
        rcur  = rconn.cursor()

        rcur.execute("SET FOREIGN_KEY_CHECKS=0")
        rcur.execute("SET UNIQUE_CHECKS=0")

        ss_sel  = ", ".join(f"[{c}]" for c in common_cols)
        my_cols = ", ".join(f"`{c}`" for c in common_cols)
        ph      = ", ".join(["%s"] * len(common_cols))

        if mode == "REPLACE":
            remote_pks_check = my_get_primary_keys(rcur, table)
            pk_in_common = all(p in common_cols for p in remote_pks_check)
            if pk_in_common:
                rcur.execute(f"TRUNCATE TABLE `{table}`")
                rconn.commit()
                sql = f"INSERT IGNORE INTO `{table}` ({my_cols}) VALUES ({ph})"
            else:
                sql = f"INSERT IGNORE INTO `{table}` ({my_cols}) VALUES ({ph})"
        elif mode == "INSERT IGNORE":
            sql = f"INSERT IGNORE INTO `{table}` ({my_cols}) VALUES ({ph})"
        else:
            sql = f"INSERT INTO `{table}` ({my_cols}) VALUES ({ph})"

        lcur.execute(f"SELECT {ss_sel} FROM [{table}]")
        all_rows = []
        while True:
            chunk = lcur.fetchmany(CHUNK_SIZE)
            if not chunk:
                break
            all_rows.extend(coerce_row(r) for r in chunk)
        lconn.close()

        try: rconn.close()
        except: pass
        rconn = connect_mysql(cfg_remote)
        rcur  = rconn.cursor()
        rcur.execute("SET FOREIGN_KEY_CHECKS=0")
        rcur.execute("SET UNIQUE_CHECKS=0")

        if mode == "REPLACE" and sql.startswith("INSERT INTO"):
            remote_pks_check2 = my_get_primary_keys(rcur, table)
            pk_in_common2 = all(p in common_cols for p in remote_pks_check2)
            if pk_in_common2:
                rcur.execute(f"TRUNCATE TABLE `{table}`")
                rconn.commit()

        total = 0
        current_batch = batch_size
        i = 0
        consecutive_errors = 0
        while i < len(all_rows):
            batch = all_rows[i:i+current_batch]
            try:
                rcur.executemany(sql, batch)
                rconn.commit()
                i += current_batch
                total += len(batch)
                consecutive_errors = 0
            except Exception as batch_err:
                err_str = str(batch_err)
                is_conn_err = any(c in err_str for c in ("2013", "2006", "2055", "10054", "10053"))
                is_packet_err = "max_allowed_packet" in err_str.lower()
                if (is_conn_err or is_packet_err) and current_batch > 1:
                    consecutive_errors += 1
                    if consecutive_errors >= 3:
                        current_batch = 1
                    else:
                        current_batch = max(1, current_batch // 4)
                    try: rconn.close()
                    except: pass
                    import time; time.sleep(min(consecutive_errors * 0.5, 3))
                    rconn = connect_mysql(cfg_remote)
                    rcur  = rconn.cursor()
                    rcur.execute("SET FOREIGN_KEY_CHECKS=0")
                    rcur.execute("SET UNIQUE_CHECKS=0")
                    continue
                raise

        rconn.close()
        return total, None

    except Exception as e:
        return 0, str(e)


# ── Master sync orchestrator ──────────────────────────────────────────────────

def sync_databases(cfg, log_widget=None, _log_override=None):
    def _log(msg):
        log(msg, log_widget)
        if _log_override:
            try: _log_override(msg)
            except: pass

    # ── Parse include / exclude table lists ───────────────────────────────────
    # Include takes priority: if any tables are listed there, ONLY those are synced
    # and the exclude list is ignored entirely.
    include_raw = cfg["sync"].get("include_tables", "")
    exclude_raw = cfg["sync"].get("exclude_tables", "")
    include     = [t.strip() for t in include_raw.split(",") if t.strip()]
    exclude     = [t.strip() for t in exclude_raw.split(",") if t.strip()]

    mode        = cfg["sync"]["mode"]
    batch_size  = int(cfg["sync"].get("batch_size", 500))
    max_workers = int(cfg["sync"].get("max_workers", 4))
    is_mirror   = (mode == "MIRROR")

    _log("═"*60)
    _log(f"Starting sync  [{mode}]:  SQL Server  →  MySQL")

    auth_mode = "Windows Auth" if cfg["local"].get("windows_auth") else "SQL Server Auth"
    _log(f"Local auth: {auth_mode}")

    # Log filter summary
    if include:
        _log(f"Include filter active — only syncing: {', '.join(include)}")
        if exclude:
            _log("  (Exclude list ignored because Include list is set)")
    elif exclude:
        _log(f"Exclude filter: {', '.join(exclude)}")

    try:
        _log("Connecting for schema discovery...")
        lconn = connect_sqlserver(cfg["local"])
        lcur  = lconn.cursor()
        rconn = connect_mysql(cfg["remote"])
        rcur  = rconn.cursor()
        _log("✔ Connected.")
    except Exception as e:
        _log(f"✘ Connection failed: {e}")
        return False, str(e)

    tables = ss_get_tables(lcur)
    _log(f"Found {len(tables)} table(s) in SQL Server.")

    work = []  # (table, common_cols, pk_cols)
    for table in tables:
        # ── Table filter logic ────────────────────────────────────────────────
        # Include list takes full priority over exclude list.
        if include:
            if table not in include:
                _log(f"  ⊘ Skip (not in include list): {table}")
                continue
        elif table in exclude:
            _log(f"  ⊘ Skip (excluded): {table}")
            continue

        local_cols = ss_get_columns(lcur, table)
        try:
            remote_cols = my_get_columns(rcur, table)
        except Exception:
            _log(f"  ⚠ {table}: not in remote, skipping.")
            continue

        common = [c for c in local_cols if c in remote_cols]
        if not common:
            _log(f"  ⚠ {table}: no common columns, skipping.")
            continue

        pk_cols = []
        if is_mirror:
            ss_pks  = ss_get_primary_keys(lcur, table)
            my_pks  = my_get_primary_keys(rcur, table)
            pk_cols = [p for p in ss_pks if p in my_pks and p in common]
            if not pk_cols:
                _log(f"  ⚠ {table}: no common PKs — falling back to REPLACE.")

        work.append((table, common, pk_cols))

    lconn.close()
    rconn.close()

    _log(f"Syncing {len(work)} table(s) — {max_workers} workers, batch={batch_size}...")

    synced_rows = synced_tables = 0
    failed = []

    def run_table(item):
        table, common, pk_cols = item
        if is_mirror and pk_cols:
            ins, upd, dlt, err = mirror_table(
                table, common, pk_cols, batch_size, cfg["local"], cfg["remote"])
            return table, ("mirror", ins, upd, dlt), err
        else:
            actual_mode = "REPLACE" if (is_mirror and not pk_cols) else mode
            rows, err = sync_one_table(
                table, common, actual_mode, batch_size, cfg["local"], cfg["remote"])
            return table, ("simple", rows), err

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(run_table, item): item[0] for item in work}
        for future in as_completed(futures):
            table = futures[future]
            tbl, result, err = future.result()
            if err:
                _log(f"  ✘ {tbl}: {err}")
                failed.append(tbl)
            else:
                if result[0] == "mirror":
                    _, ins, upd, dlt = result
                    _log(f"  ✔ {tbl}: +{ins} inserted  ~{upd} updated  -{dlt} deleted")
                    synced_rows += ins + upd + dlt
                else:
                    _, rows = result
                    _log(f"  ✔ {tbl}: {rows} row(s)")
                    synced_rows += rows
                synced_tables += 1

    if failed:
        msg = f"Done with errors — {synced_tables} OK, {len(failed)} failed: {', '.join(failed)}"
    else:
        msg = f"Sync complete ✔ — {synced_tables} tables, {synced_rows:,} operations."

    _log(msg)
    _log("═"*60)
    return len(failed) == 0, msg


# ── Task Scheduler ────────────────────────────────────────────────────────────

def get_exe_path():
    return sys.executable if getattr(sys, 'frozen', False) else os.path.abspath(__file__)

def create_scheduled_task(sync_time):
    exe = get_exe_path()
    h, m = sync_time.split(":")
    r = subprocess.run(
        ["schtasks","/Create","/F","/TN","SQLServerMySQLSync",
         "/TR", f'"{exe}" --headless',
         "/SC","DAILY","/ST",f"{h}:{m}","/RL","HIGHEST"],
        capture_output=True, text=True)
    return (True, f"Task created — runs daily at {sync_time}.") if r.returncode==0 \
           else (False, f"Failed: {r.stderr}")

def delete_scheduled_task():
    r = subprocess.run(["schtasks","/Delete","/TN","SQLServerMySQLSync","/F"],
                       capture_output=True, text=True)
    return (True,"Task removed.") if r.returncode==0 else (False, r.stderr)

def task_exists():
    r = subprocess.run(["schtasks","/Query","/TN","SQLServerMySQLSync"],
                       capture_output=True, text=True)
    return r.returncode==0



# ── GUI ────────────────────────────────────────────────────────────────────────────────────

# ── Color palette & fonts ──────────────────────────────────────────────────────────────────
BG        = "#0f1117"   # near-black background
BG2       = "#1a1d27"   # card/panel background
BG3       = "#22263a"   # slightly lighter panel
BORDER    = "#2e3350"   # subtle border
ACCENT    = "#4f8ef7"   # electric blue accent
ACCENT2   = "#3ddc97"   # mint green (success)
WARN      = "#f7c948"   # amber (warning)
ERR       = "#f75d5d"   # red (error)
TEXT      = "#e8eaf6"   # primary text
TEXT2     = "#7c83a8"   # secondary/muted text
TEXT3     = "#4a506e"   # very muted

FONT_MONO = ("Consolas", 9)
FONT_SM   = ("Segoe UI", 9)
FONT_MD   = ("Segoe UI", 10)
FONT_LG   = ("Segoe UI Semibold", 11)
FONT_H    = ("Segoe UI Semibold", 13)
FONT_ICON = ("Segoe UI", 14)


def _style_ttk():
    """Configure ttk styles for dark theme."""
    style = ttk.Style()
    style.theme_use("clam")

    # General
    style.configure(".", background=BG2, foreground=TEXT, font=FONT_MD,
                    bordercolor=BORDER, troughcolor=BG3, selectbackground=ACCENT)
    style.configure("TFrame",       background=BG2)
    style.configure("TLabel",       background=BG2, foreground=TEXT, font=FONT_MD)
    style.configure("TLabelframe",  background=BG2, foreground=TEXT2, font=FONT_SM,
                    bordercolor=BORDER, relief="flat")
    style.configure("TLabelframe.Label", background=BG2, foreground=ACCENT, font=("Segoe UI Semibold", 9))

    # Notebook tabs
    style.configure("TNotebook",    background=BG, tabmargins=[0,0,0,0], bordercolor=BG)
    style.configure("TNotebook.Tab", background=BG3, foreground=TEXT2, font=FONT_MD,
                    padding=[18, 8], bordercolor=BG)
    style.map("TNotebook.Tab",
              background=[("selected", BG2), ("active", BG3)],
              foreground=[("selected", TEXT), ("active", TEXT)])

    # Entry
    style.configure("TEntry", fieldbackground=BG3, foreground=TEXT, insertcolor=TEXT,
                    bordercolor=BORDER, relief="flat", padding=6)
    style.map("TEntry", bordercolor=[("focus", ACCENT)])

    # Combobox
    style.configure("TCombobox", fieldbackground=BG3, foreground=TEXT, background=BG3,
                    selectbackground=ACCENT, bordercolor=BORDER, arrowcolor=TEXT2)
    style.map("TCombobox", fieldbackground=[("readonly", BG3)])

    # Spinbox
    style.configure("TSpinbox", fieldbackground=BG3, foreground=TEXT, insertcolor=TEXT,
                    bordercolor=BORDER, arrowcolor=TEXT2, background=BG3)

    # Scrollbar
    style.configure("TScrollbar", background=BG3, troughcolor=BG2,
                    bordercolor=BG2, arrowcolor=TEXT3)
    style.map("TScrollbar", background=[("active", BORDER)])

    # Progressbar
    style.configure("TProgressbar", troughcolor=BG3, background=ACCENT,
                    bordercolor=BG3, thickness=6)

    # Buttons
    style.configure("TButton", background=BG3, foreground=TEXT, font=FONT_MD,
                    bordercolor=BORDER, focuscolor=ACCENT, padding=[12,6], relief="flat")
    style.map("TButton",
              background=[("active", BORDER), ("pressed", ACCENT)],
              foreground=[("active", TEXT)])

    style.configure("Accent.TButton", background=ACCENT, foreground="#ffffff",
                    font=("Segoe UI Semibold", 10), padding=[16, 8], relief="flat")
    style.map("Accent.TButton",
              background=[("active", "#3a7ae8"), ("pressed", "#2d6ad4")],
              foreground=[("active", "#ffffff")])

    style.configure("Danger.TButton", background="#3a1a1a", foreground=ERR,
                    font=FONT_MD, padding=[12, 6], relief="flat", bordercolor="#5a2020")
    style.map("Danger.TButton",
              background=[("active", "#4a2020")])

    style.configure("Success.TButton", background="#1a3a2a", foreground=ACCENT2,
                    font=("Segoe UI Semibold", 10), padding=[12, 6], relief="flat")
    style.map("Success.TButton",
              background=[("active", "#1a4a2a")])


class StatusDot(tk.Canvas):
    """Animated pulsing status indicator dot."""
    def __init__(self, parent, size=10, **kw):
        super().__init__(parent, width=size, height=size,
                         bg=BG2, highlightthickness=0, **kw)
        self._size   = size
        self._color  = TEXT3
        self._phase  = 0
        self._pulsing = False
        self._draw()

    def _draw(self):
        s = self._size
        self.delete("all")
        if self._pulsing:
            alpha_colors = ["#1a3a6a", "#1e4a8a", "#2255aa"]
            glow = alpha_colors[self._phase % 3]
            self.create_oval(1, 1, s-1, s-1, fill=glow, outline="")
        self.create_oval(3, 3, s-3, s-3, fill=self._color, outline="")

    def set_idle(self):
        self._pulsing = False
        self._color   = TEXT3
        self._draw()

    def set_active(self):
        self._pulsing = True
        self._color   = ACCENT
        self._pulse()

    def set_ok(self):
        self._pulsing = False
        self._color   = ACCENT2
        self._draw()

    def set_error(self):
        self._pulsing = False
        self._color   = ERR
        self._draw()

    def _pulse(self):
        if not self._pulsing:
            return
        self._phase += 1
        self._draw()
        self.after(400, self._pulse)


class FieldRow(tk.Frame):
    """Compact labeled input row for config fields."""
    def __init__(self, parent, label, default="", show=None, width=32, **kw):
        super().__init__(parent, bg=BG2, **kw)
        self._label_widget = tk.Label(self, text=label, font=FONT_SM, bg=BG2,
                 fg=TEXT2, width=13, anchor="w")
        self._label_widget.pack(side="left")
        self._var = tk.StringVar(value=default)
        kw2 = {"textvariable": self._var, "font": FONT_SM, "width": width}
        if show:
            kw2["show"] = show
        self._entry = tk.Entry(self, bg=BG3, fg=TEXT, insertbackground=TEXT,
                     relief="flat", bd=0, highlightthickness=1,
                     highlightbackground=BORDER, highlightcolor=ACCENT, **kw2)
        self._entry.pack(side="left", fill="x", expand=True, ipady=5, padx=(0, 2))

    def get(self):
        return self._var.get()

    def set(self, v):
        self._var.set(v)

    def set_enabled(self, enabled: bool):
        """Gray out / restore the label and entry."""
        if enabled:
            self._label_widget.configure(fg=TEXT2)
            self._entry.configure(
                state="normal",
                bg=BG3, fg=TEXT,
                highlightbackground=BORDER
            )
        else:
            self._label_widget.configure(fg=TEXT3)
            self._entry.configure(
                state="disabled",
                bg=BG2, fg=TEXT3,
                highlightbackground=BG2,
                disabledbackground=BG2,
                disabledforeground=TEXT3
            )


class Section(tk.LabelFrame):
    """Styled section frame."""
    def __init__(self, parent, title, **kw):
        super().__init__(parent, text=f"  {title}  ",
                         bg=BG2, fg=ACCENT, font=("Segoe UI Semibold", 9),
                         bd=1, relief="flat",
                         highlightbackground=BORDER, highlightthickness=1, **kw)


class SyncApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("DB Sync  ·  SQL Server → MySQL")
        self.configure(bg=BG)
        self.resizable(True, True)
        self.minsize(780, 580)

        # Set AppUserModelID so Windows taskbar shows correct icon
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("jwmj.dbsync.1")
        except Exception:
            pass

        # App window icon (title bar + taskbar)
        icon_path = os.path.join(BASE_DIR, "icon.ico")
        if os.path.exists(icon_path):
            try:
                self.iconbitmap(default=icon_path)
            except Exception:
                pass

        _style_ttk()
        self.cfg = load_config()
        self._sync_running = False
        self._build_ui()
        self._load_fields()
        self._refresh_log()

    # ── Layout ────────────────────────────────────────────────────────────────

    def _build_ui(self):
        # ── Top header bar ────────────────────────────────────────────────────
        header = tk.Frame(self, bg=BG2, height=52)
        header.pack(fill="x")
        header.pack_propagate(False)

        tk.Label(header, text="⇄", font=("Segoe UI", 18), bg=BG2,
                 fg=ACCENT).pack(side="left", padx=(18, 6), pady=8)
        tk.Label(header, text="DB Sync", font=("Segoe UI Semibold", 14),
                 bg=BG2, fg=TEXT).pack(side="left")
        tk.Label(header, text="SQL Server → MySQL", font=FONT_SM,
                 bg=BG2, fg=TEXT2).pack(side="left", padx=(10, 0), pady=3, anchor="s")

        # Status pill (top right)
        self._status_frame = tk.Frame(header, bg=BG2)
        self._status_frame.pack(side="right", padx=16)
        self._status_dot = StatusDot(self._status_frame, size=12)
        self._status_dot.pack(side="left", padx=(0, 5))
        self._status_lbl = tk.Label(self._status_frame, text="Idle",
                                    font=FONT_SM, bg=BG2, fg=TEXT2)
        self._status_lbl.pack(side="left")

        # ── Separator ─────────────────────────────────────────────────────────
        tk.Frame(self, bg=BORDER, height=1).pack(fill="x")

        # ── Tab bar ───────────────────────────────────────────────────────────
        self._nb = ttk.Notebook(self)
        self._nb.pack(fill="both", expand=True)

        self._tab_cfg  = tk.Frame(self._nb, bg=BG2)
        self._tab_sync = tk.Frame(self._nb, bg=BG2)
        self._tab_sched= tk.Frame(self._nb, bg=BG2)
        self._tab_log  = tk.Frame(self._nb, bg=BG2)

        self._nb.add(self._tab_cfg,   text="  ⚙  Config  ")
        self._nb.add(self._tab_sync,  text="  ▶  Sync  ")
        self._nb.add(self._tab_sched, text="  🕒  Schedule  ")
        self._nb.add(self._tab_log,   text="  📋  Log  ")

        self._build_config_tab()
        self._build_sync_tab()
        self._build_schedule_tab()
        self._build_log_tab()

    # ── Config tab ────────────────────────────────────────────────────────────

    def _build_config_tab(self):
        f = self._tab_cfg
        f.columnconfigure(0, weight=1)
        f.columnconfigure(1, weight=1)

        pad = dict(padx=14, pady=6)

        # ── Local SQL Server ──────────────────────────────────────────────────
        local_sec = Section(f, "Local  —  SQL Server")
        local_sec.grid(row=0, column=0, sticky="nsew", **pad)

        self._lf = {}
        for key, label, default, show in [
            ("host",     "Host",        "localhost",                     None),
            ("port",     "Port",        "1433",                          None),
            ("database", "Database",    "",                              None),
            ("driver",   "ODBC Driver", "ODBC Driver 17 for SQL Server", None),
        ]:
            row = FieldRow(local_sec, label, default, show)
            row.pack(fill="x", padx=8, pady=3)
            self._lf[key] = row

        # ── Windows Auth toggle ───────────────────────────────────────────────
        auth_frame = tk.Frame(local_sec, bg=BG2)
        auth_frame.pack(fill="x", padx=8, pady=(6, 2))

        self._win_auth_var = tk.BooleanVar(value=False)
        self._win_auth_cb = tk.Checkbutton(
            auth_frame,
            text="Use Windows Authentication  (Trusted_Connection)",
            variable=self._win_auth_var,
            font=FONT_SM, bg=BG2, fg=TEXT,
            activebackground=BG2, activeforeground=ACCENT,
            selectcolor=BG3,
            command=self._on_win_auth_toggle,
            cursor="hand2"
        )
        self._win_auth_cb.pack(side="left")

        # Windows-auth info badge
        self._win_auth_badge = tk.Label(
            auth_frame,
            text="  ✦ Uses your Windows login — no credentials needed",
            font=("Segoe UI", 8), bg=BG2, fg=ACCENT2
        )

        # Separator line
        tk.Frame(local_sec, bg=BORDER, height=1).pack(fill="x", padx=8, pady=4)

        # ── SQL Server credentials ────────────────────────────────────────────
        self._cred_rows = {}
        for key, label, default, show in [
            ("user",     "User",     "", None),
            ("password", "Password", "", "*"),
        ]:
            row = FieldRow(local_sec, label, default, show)
            row.pack(fill="x", padx=8, pady=3)
            self._lf[key]       = row
            self._cred_rows[key] = row

        tk.Label(local_sec, text="Tip: older driver name is 'SQL Server'",
                 font=("Segoe UI", 8), bg=BG2, fg=TEXT3).pack(anchor="w", padx=8, pady=(0, 4))

        # ── Remote MySQL ──────────────────────────────────────────────────────
        remote_sec = Section(f, "Remote  —  MySQL (DirectAdmin)")
        remote_sec.grid(row=0, column=1, sticky="nsew", **pad)

        self._rf = {}
        for key, label, default, show in [
            ("host",     "Host",     "",     None),
            ("port",     "Port",     "3306", None),
            ("user",     "User",     "",     None),
            ("password", "Password", "",     "*"),
            ("database", "Database", "",     None),
        ]:
            row = FieldRow(remote_sec, label, default, show)
            row.pack(fill="x", padx=8, pady=3)
            self._rf[key] = row

        # ── Sync Options ──────────────────────────────────────────────────────
        opts_sec = Section(f, "Sync Options")
        opts_sec.grid(row=1, column=0, sticky="nsew", **pad)

        # Mode selector
        mf = tk.Frame(opts_sec, bg=BG2)
        mf.pack(fill="x", padx=8, pady=6)
        tk.Label(mf, text="Mode", font=FONT_SM, bg=BG2,
                 fg=TEXT2, width=13, anchor="w").pack(side="left")
        self._sync_mode = ttk.Combobox(mf,
            values=["MIRROR", "REPLACE", "INSERT IGNORE", "INSERT"],
            state="readonly", width=18, font=FONT_SM)
        self._sync_mode.pack(side="left")
        self._sync_mode.bind("<<ComboboxSelected>>", self._on_mode_change)

        self._mode_badge = tk.Label(mf, text="", font=("Segoe UI", 8),
                                    bg=BG2, fg=ACCENT2)
        self._mode_badge.pack(side="left", padx=8)

        # ── Include tables ────────────────────────────────────────────────────
        inc_outer = tk.Frame(opts_sec, bg=BG2)
        inc_outer.pack(fill="x", padx=8, pady=(6, 2))

        inc_row = tk.Frame(inc_outer, bg=BG2)
        inc_row.pack(fill="x")
        tk.Label(inc_row, text="Include tables", font=FONT_SM, bg=BG2,
                 fg=TEXT2, width=13, anchor="w").pack(side="left")
        self._include_var = tk.StringVar()
        tk.Entry(inc_row, textvariable=self._include_var, font=FONT_SM,
                 bg=BG3, fg=TEXT, insertbackground=TEXT, relief="flat",
                 bd=0, highlightthickness=1, highlightbackground=BORDER,
                 highlightcolor=ACCENT, width=30).pack(side="left", ipady=5)
        tk.Label(inc_row, text="comma-separated", font=("Segoe UI", 8),
                 bg=BG2, fg=TEXT3).pack(side="left", padx=6)

        # Dynamic badge shown when include field has content
        self._include_badge = tk.Label(
            inc_outer,
            text="",
            font=("Segoe UI", 8), bg=BG2, fg=WARN,
            wraplength=340, justify="left"
        )
        self._include_badge.pack(anchor="w", padx=1)
        self._include_var.trace_add("write", self._on_filter_change)

        # ── Exclude tables ────────────────────────────────────────────────────
        ef = tk.Frame(opts_sec, bg=BG2)
        ef.pack(fill="x", padx=8, pady=4)
        tk.Label(ef, text="Exclude tables", font=FONT_SM, bg=BG2,
                 fg=TEXT2, width=13, anchor="w").pack(side="left")
        self._exclude_var = tk.StringVar()
        tk.Entry(ef, textvariable=self._exclude_var, font=FONT_SM,
                 bg=BG3, fg=TEXT, insertbackground=TEXT, relief="flat",
                 bd=0, highlightthickness=1, highlightbackground=BORDER,
                 highlightcolor=ACCENT, width=30).pack(side="left", ipady=5)
        tk.Label(ef, text="comma-separated", font=("Segoe UI", 8),
                 bg=BG2, fg=TEXT3).pack(side="left", padx=6)

        # Mutual-exclusion conflict note
        self._filter_conflict_lbl = tk.Label(
            opts_sec,
            text="",
            font=("Segoe UI", 8), bg=BG2, fg=ERR
        )
        self._filter_conflict_lbl.pack(anchor="w", padx=8, pady=(0, 4))
        self._exclude_var.trace_add("write", self._on_filter_change)

        # ── Performance ───────────────────────────────────────────────────────
        perf_sec = Section(f, "Performance")
        perf_sec.grid(row=1, column=1, sticky="nsew", **pad)

        for label, attr, frm_, to_, inc in [
            ("Parallel tables",   "_workers_var",  1,    16,   1),
            ("Batch size (rows)", "_batch_var",   100, 5000, 100),
        ]:
            pf2 = tk.Frame(perf_sec, bg=BG2)
            pf2.pack(fill="x", padx=8, pady=5)
            tk.Label(pf2, text=label, font=FONT_SM, bg=BG2,
                     fg=TEXT2, width=16, anchor="w").pack(side="left")
            var = tk.StringVar()
            setattr(self, attr, var)
            sp = ttk.Spinbox(pf2, textvariable=var, from_=frm_, to=to_,
                             increment=inc, width=8, font=FONT_SM)
            sp.pack(side="left")

        tk.Label(perf_sec, text="Recommended: 4–8 workers · 500–2000 batch",
                 font=("Segoe UI", 8), bg=BG2, fg=TEXT3).pack(anchor="w", padx=8, pady=(2, 6))

        # ── Action buttons ────────────────────────────────────────────────────
        btn_row = tk.Frame(f, bg=BG2)
        btn_row.grid(row=2, column=0, columnspan=2, pady=(4, 14))

        ttk.Button(btn_row, text="💾  Save Configuration",
                   command=self._save_config, style="Accent.TButton").pack(side="left", padx=6)
        ttk.Button(btn_row, text="🔌  Test Connections",
                   command=self._test_connections).pack(side="left", padx=6)

    def _on_filter_change(self, *_):
        """Update the include badge and conflict warning live as the user types."""
        inc = self._include_var.get().strip()
        exc = self._exclude_var.get().strip()

        if inc:
            tables = [t.strip() for t in inc.split(",") if t.strip()]
            self._include_badge.configure(
                text=f"⚑ Only syncing: {', '.join(tables)}  —  all other tables will be skipped"
            )
        else:
            self._include_badge.configure(text="")

        if inc and exc:
            self._filter_conflict_lbl.configure(
                text="⚠ Include list is active — Exclude list will be ignored"
            )
        else:
            self._filter_conflict_lbl.configure(text="")

    def _on_win_auth_toggle(self):
        """Show/hide user+password fields and badge based on auth mode."""
        using_windows = self._win_auth_var.get()
        for row in self._cred_rows.values():
            row.set_enabled(not using_windows)
        if using_windows:
            self._win_auth_badge.pack(side="left", padx=(8, 0))
        else:
            self._win_auth_badge.pack_forget()

    def _on_mode_change(self, _=None):
        descs = {
            "MIRROR":       ("✦ Exact copy  +INSERT  ~UPDATE  −DELETE", ACCENT2),
            "REPLACE":      ("⟳ Truncate + re-insert all rows",          WARN),
            "INSERT IGNORE":("+ New rows only, never modifies",           TEXT2),
            "INSERT":       ("⚠ Plain insert — errors on duplicates",     ERR),
        }
        txt, col = descs.get(self._sync_mode.get(), ("", TEXT2))
        self._mode_badge.configure(text=txt, fg=col)

    # ── Sync tab ──────────────────────────────────────────────────────────────

    def _build_sync_tab(self):
        f = self._tab_sync

        # ── Mode legend cards ─────────────────────────────────────────────────
        cards_frame = tk.Frame(f, bg=BG2)
        cards_frame.pack(fill="x", padx=20, pady=(20, 0))

        modes = [
            ("MIRROR",  ACCENT,  "✦", "INSERT new  ·  UPDATE changed  ·  DELETE removed\nMakes remote an exact byte-for-byte copy of local."),
            ("REPLACE", WARN,    "⟳", "TRUNCATE remote, then re-INSERT all local rows.\nFull wipe + reload — safest initial sync."),
        ]
        for title, color, icon, desc in modes:
            card = tk.Frame(cards_frame, bg=BG3, bd=0,
                            highlightthickness=1, highlightbackground=color)
            card.pack(side="left", fill="both", expand=True, padx=6, pady=4)
            tk.Label(card, text=f"{icon}  {title}", font=("Segoe UI Semibold", 11),
                     bg=BG3, fg=color).pack(anchor="w", padx=12, pady=(10, 2))
            tk.Label(card, text=desc, font=("Segoe UI", 9), bg=BG3,
                     fg=TEXT2, justify="left").pack(anchor="w", padx=12, pady=(0, 10))

        # ── Active filter indicator ───────────────────────────────────────────
        filter_row = tk.Frame(f, bg=BG2)
        filter_row.pack(fill="x", padx=20, pady=(10, 0))
        tk.Label(filter_row, text="Table filter:", font=FONT_SM, bg=BG2, fg=TEXT2).pack(side="left")
        self._sync_filter_label = tk.Label(filter_row, text="All tables",
                                            font=("Segoe UI Semibold", 10),
                                            bg=BG2, fg=TEXT3)
        self._sync_filter_label.pack(side="left", padx=8)

        # ── Current mode indicator ─────────────────────────────────────────────
        mode_row = tk.Frame(f, bg=BG2)
        mode_row.pack(fill="x", padx=20, pady=(4, 0))
        tk.Label(mode_row, text="Active mode:", font=FONT_SM, bg=BG2, fg=TEXT2).pack(side="left")
        self._sync_mode_label = tk.Label(mode_row, text="—", font=("Segoe UI Semibold", 10),
                                          bg=BG2, fg=ACCENT)
        self._sync_mode_label.pack(side="left", padx=8)

        # ── Big run button ────────────────────────────────────────────────────
        btn_area = tk.Frame(f, bg=BG2)
        btn_area.pack(pady=18)

        self._sync_btn = tk.Button(
            btn_area,
            text="▶   RUN SYNC NOW",
            font=("Segoe UI Semibold", 13),
            bg=ACCENT, fg="#ffffff",
            activebackground="#3a7ae8", activeforeground="#ffffff",
            relief="flat", bd=0, padx=32, pady=14,
            cursor="hand2",
            command=self._run_sync_thread
        )
        self._sync_btn.pack()

        # ── Progress bar ──────────────────────────────────────────────────────
        prog_frame = tk.Frame(f, bg=BG2)
        prog_frame.pack(fill="x", padx=40, pady=(0, 6))

        self._progress = ttk.Progressbar(prog_frame, style="TProgressbar",
                                          mode="indeterminate", length=500)
        self._progress.pack(fill="x")

        # ── Stats row ─────────────────────────────────────────────────────────
        stats_frame = tk.Frame(f, bg=BG2)
        stats_frame.pack()

        self._stat_labels = {}
        for key, icon, label in [
            ("status",  "",  ""),
            ("time",    "⏱", "Elapsed"),
        ]:
            sf = tk.Frame(stats_frame, bg=BG2)
            sf.pack(side="left", padx=16)
            if icon:
                tk.Label(sf, text=icon, font=FONT_SM, bg=BG2, fg=TEXT3).pack(side="left", padx=(0,3))
            lbl = tk.Label(sf, text="—" if key == "time" else "", font=FONT_SM,
                           bg=BG2, fg=TEXT2)
            lbl.pack(side="left")
            self._stat_labels[key] = lbl

        # ── Live mini-log ─────────────────────────────────────────────────────
        log_sec = Section(f, "Live Output")
        log_sec.pack(fill="both", expand=True, padx=20, pady=(12, 16))

        self._mini_log = tk.Text(
            log_sec, bg=BG, fg=TEXT2, font=FONT_MONO,
            relief="flat", bd=0, state="disabled",
            height=10, wrap="none",
            highlightthickness=0, selectbackground=ACCENT,
            padx=6, pady=6)
        self._mini_log.pack(fill="both", expand=True, padx=2, pady=2)

        # Tag colors for log
        self._mini_log.tag_configure("ok",    foreground=ACCENT2)
        self._mini_log.tag_configure("err",   foreground=ERR)
        self._mini_log.tag_configure("warn",  foreground=WARN)
        self._mini_log.tag_configure("dim",   foreground=TEXT3)
        self._mini_log.tag_configure("head",  foreground=ACCENT)

        # Scrollbar
        sb = ttk.Scrollbar(log_sec, command=self._mini_log.yview)
        self._mini_log.configure(yscrollcommand=sb.set)

        self._sync_start_time = None

    def _set_status(self, text, color=TEXT2):
        self._status_lbl.configure(text=text, fg=color)

    def _append_mini_log(self, line):
        """Append a line to the mini-log with color tagging."""
        self._mini_log.configure(state="normal")
        tag = "dim"
        l = line.lower()
        if "✔" in line or "sync complete" in line:  tag = "ok"
        elif "✘" in line or "failed" in line:        tag = "err"
        elif "⚠" in line or "warning" in line:       tag = "warn"
        elif "═" in line or "starting" in line:      tag = "head"
        self._mini_log.insert("end", line + "\n", tag)
        self._mini_log.see("end")
        self._mini_log.configure(state="disabled")

    def _run_sync_thread(self):
        if self._sync_running:
            return
        self._sync_running = True
        self.cfg = self._collect_config()
        save_config(self.cfg)

        # Update mode label
        self._sync_mode_label.configure(text=self.cfg["sync"]["mode"])

        # Update filter label on the sync tab
        inc = self.cfg["sync"].get("include_tables", "").strip()
        exc = self.cfg["sync"].get("exclude_tables", "").strip()
        if inc:
            tables = [t.strip() for t in inc.split(",") if t.strip()]
            self._sync_filter_label.configure(
                text=f"⚑ Only: {', '.join(tables)}", fg=WARN)
        elif exc:
            self._sync_filter_label.configure(
                text=f"Excluding: {exc}", fg=TEXT2)
        else:
            self._sync_filter_label.configure(text="All tables", fg=TEXT3)

        self._sync_btn.configure(state="disabled", bg=BG3, fg=TEXT2,
                                  text="⏳  Syncing…")
        self._progress.start(12)
        self._status_dot.set_active()
        self._set_status("Syncing…", ACCENT)

        # Clear mini log
        self._mini_log.configure(state="normal")
        self._mini_log.delete("1.0", "end")
        self._mini_log.configure(state="disabled")

        self._sync_start_time = datetime.datetime.now()
        self._update_elapsed()

        threading.Thread(target=self._do_sync, daemon=True).start()

    def _update_elapsed(self):
        if not self._sync_running or not self._sync_start_time:
            return
        elapsed = datetime.datetime.now() - self._sync_start_time
        secs = int(elapsed.total_seconds())
        m, s = divmod(secs, 60)
        self._stat_labels["time"].configure(
            text=f"{m:02d}:{s:02d}", fg=TEXT2)
        self.after(1000, self._update_elapsed)

    def _do_sync(self):
        success, msg = sync_databases(self.cfg, log_widget=None,
                                       _log_override=self._append_mini_log)
        self.after(0, self._sync_done, success, msg)

    def _sync_done(self, success, msg):
        self._sync_running = False
        self._progress.stop()
        self._sync_btn.configure(
            state="normal",
            bg=ACCENT, fg="#ffffff",
            text="▶   RUN SYNC NOW"
        )
        if success:
            self._status_dot.set_ok()
            self._set_status("Complete", ACCENT2)
            self._stat_labels["status"].configure(text=msg, fg=ACCENT2)
        else:
            self._status_dot.set_error()
            self._set_status("Errors", ERR)
            self._stat_labels["status"].configure(text=msg, fg=ERR)
        self._refresh_log()

    # ── Schedule tab ──────────────────────────────────────────────────────────

    def _build_schedule_tab(self):
        f = self._tab_sched

        info_frame = tk.Frame(f, bg=BG3, highlightthickness=1,
                               highlightbackground=BORDER)
        info_frame.pack(fill="x", padx=20, pady=20)
        tk.Label(info_frame, text="🕒  Windows Task Scheduler",
                 font=("Segoe UI Semibold", 12), bg=BG3, fg=TEXT).pack(anchor="w", padx=16, pady=(12,2))
        tk.Label(info_frame,
                 text="Runs the sync silently in the background at a set time every day.\n"
                      "Admin privileges required. The .py / .exe must stay in the same folder.",
                 font=FONT_SM, bg=BG3, fg=TEXT2, justify="left").pack(anchor="w", padx=16, pady=(0,12))

        # Task status card
        status_card = tk.Frame(f, bg=BG2)
        status_card.pack(pady=(0, 16))

        self._task_dot = StatusDot(status_card, size=14)
        self._task_dot.pack(side="left", padx=(0, 8))
        self._task_lbl = tk.Label(status_card, text="Checking…",
                                   font=("Segoe UI Semibold", 11), bg=BG2, fg=TEXT2)
        self._task_lbl.pack(side="left")

        # Time picker
        time_frame = tk.Frame(f, bg=BG2)
        time_frame.pack(pady=8)
        tk.Label(time_frame, text="Sync time  (HH:MM)", font=FONT_MD,
                 bg=BG2, fg=TEXT2).pack(side="left", padx=(0, 10))
        self._schedule_time = tk.StringVar(value=self.cfg["sync"].get("sync_time","02:00"))
        tk.Entry(time_frame, textvariable=self._schedule_time,
                 width=8, font=("Segoe UI Semibold", 13),
                 bg=BG3, fg=ACCENT, insertbackground=ACCENT,
                 relief="flat", bd=0, highlightthickness=1,
                 highlightbackground=BORDER, highlightcolor=ACCENT,
                 justify="center").pack(side="left", ipady=6)

        # Buttons
        btn_row = tk.Frame(f, bg=BG2)
        btn_row.pack(pady=16)
        ttk.Button(btn_row, text="✔  Create / Update Task",
                   command=self._create_task, style="Success.TButton").pack(side="left", padx=6)
        ttk.Button(btn_row, text="✘  Remove Task",
                   command=self._remove_task, style="Danger.TButton").pack(side="left", padx=6)

        self._refresh_task_status()

    def _refresh_task_status(self):
        if task_exists():
            self._task_dot.set_ok()
            self._task_lbl.configure(text="Task is ACTIVE — syncs daily", fg=ACCENT2)
        else:
            self._task_dot.set_idle()
            self._task_lbl.configure(text="No scheduled task", fg=TEXT3)

    def _create_task(self):
        t = self._schedule_time.get().strip()
        try:
            h, m = t.split(":"); assert 0<=int(h)<=23 and 0<=int(m)<=59
        except Exception:
            messagebox.showerror("Invalid Time","Use HH:MM e.g. 02:00"); return
        self.cfg["sync"]["sync_time"] = t
        save_config(self.cfg)
        ok, msg = create_scheduled_task(t)
        (messagebox.showinfo if ok else messagebox.showerror)("Scheduler", msg)
        self._refresh_task_status()

    def _remove_task(self):
        ok, msg = delete_scheduled_task()
        (messagebox.showinfo if ok else messagebox.showerror)("Scheduler", msg)
        self._refresh_task_status()

    # ── Log tab ───────────────────────────────────────────────────────────────

    def _build_log_tab(self):
        f = self._tab_log

        # Toolbar
        toolbar = tk.Frame(f, bg=BG3, height=38)
        toolbar.pack(fill="x")
        toolbar.pack_propagate(False)

        ttk.Button(toolbar, text="🔄 Refresh", command=self._refresh_log).pack(side="left", padx=6, pady=4)
        ttk.Button(toolbar, text="🗑 Clear Log", command=self._clear_log,
                   style="Danger.TButton").pack(side="left", padx=2, pady=4)

        # Auto-refresh toggle
        self._auto_refresh_var = tk.BooleanVar(value=True)
        tk.Checkbutton(
            toolbar, text="Auto-refresh",
            variable=self._auto_refresh_var,
            font=FONT_SM, bg=BG3, fg=TEXT2,
            activebackground=BG3, activeforeground=ACCENT,
            selectcolor=BG2,
            command=self._on_auto_refresh_toggle,
            cursor="hand2"
        ).pack(side="left", padx=8)

        # Interval selector
        tk.Label(toolbar, text="every", font=FONT_SM, bg=BG3, fg=TEXT3).pack(side="left")
        self._refresh_interval_var = tk.StringVar(value="5s")
        interval_cb = ttk.Combobox(toolbar, textvariable=self._refresh_interval_var,
                                    values=["2s", "5s", "10s", "30s", "60s"],
                                    state="readonly", width=5, font=FONT_SM)
        interval_cb.pack(side="left", padx=(4, 0))
        interval_cb.bind("<<ComboboxSelected>>", lambda _: self._restart_auto_refresh())

        self._log_count_lbl = tk.Label(toolbar, text="", font=FONT_SM,
                                        bg=BG3, fg=TEXT3)
        self._log_count_lbl.pack(side="right", padx=12)

        self._auto_refresh_lbl = tk.Label(toolbar, text="⏱ next refresh…",
                                           font=("Segoe UI", 8), bg=BG3, fg=TEXT3)
        self._auto_refresh_lbl.pack(side="right", padx=6)

        self._auto_refresh_job  = None
        self._auto_refresh_countdown = 0

        self.after(500, self._restart_auto_refresh)

        # Log text widget
        log_frame = tk.Frame(f, bg=BG)
        log_frame.pack(fill="both", expand=True)

        self.log_widget = tk.Text(
            log_frame, bg=BG, fg=TEXT2, font=FONT_MONO,
            relief="flat", bd=0, state="disabled",
            wrap="none", highlightthickness=0, selectbackground=ACCENT,
            padx=6, pady=6)
        self.log_widget.pack(side="left", fill="both", expand=True, padx=(4,0), pady=(4,8))

        sb = ttk.Scrollbar(log_frame, command=self.log_widget.yview)
        sb.pack(side="right", fill="y", pady=8)
        self.log_widget.configure(yscrollcommand=sb.set)

        # Color tags
        self.log_widget.tag_configure("ok",   foreground=ACCENT2)
        self.log_widget.tag_configure("err",  foreground=ERR)
        self.log_widget.tag_configure("warn", foreground=WARN)
        self.log_widget.tag_configure("head", foreground=ACCENT)
        self.log_widget.tag_configure("dim",  foreground=TEXT3)

    def _refresh_log(self):
        self.log_widget.configure(state="normal")
        self.log_widget.delete("1.0", "end")
        lines = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                lines = f.read().strip().split("\n")
            lines = lines[-500:]

        for line in lines:
            tag = "dim"
            l = line.lower()
            if "✔" in line or "sync complete" in line:  tag = "ok"
            elif "✘" in line or "failed" in line:        tag = "err"
            elif "⚠" in line:                            tag = "warn"
            elif "═" in line or "starting" in line:      tag = "head"
            self.log_widget.insert("end", line + "\n", tag)

        self.log_widget.see("end")
        self.log_widget.configure(state="disabled")
        self._log_count_lbl.configure(text=f"{len(lines)} lines")

    def _clear_log(self):
        if messagebox.askyesno("Clear Log", "Clear the entire log file?"):
            open(LOG_FILE, "w", encoding="utf-8").close()
            self._refresh_log()

    def _get_refresh_interval_ms(self):
        val = self._refresh_interval_var.get().replace("s", "")
        try:
            return int(val) * 1000
        except ValueError:
            return 5000

    def _on_auto_refresh_toggle(self):
        if self._auto_refresh_var.get():
            self._restart_auto_refresh()
        else:
            if self._auto_refresh_job:
                self.after_cancel(self._auto_refresh_job)
                self._auto_refresh_job = None
            self._auto_refresh_lbl.configure(text="")

    def _restart_auto_refresh(self):
        if self._auto_refresh_job:
            self.after_cancel(self._auto_refresh_job)
            self._auto_refresh_job = None
        if self._auto_refresh_var.get():
            interval_ms = self._get_refresh_interval_ms()
            self._auto_refresh_countdown = interval_ms // 1000
            self._tick_auto_refresh()

    def _tick_auto_refresh(self):
        if not self._auto_refresh_var.get():
            return
        if self._auto_refresh_countdown <= 0:
            self._refresh_log()
            self._auto_refresh_countdown = self._get_refresh_interval_ms() // 1000
        else:
            self._auto_refresh_lbl.configure(
                text=f"⏱ refresh in {self._auto_refresh_countdown}s")
            self._auto_refresh_countdown -= 1
        self._auto_refresh_job = self.after(1000, self._tick_auto_refresh)

    # ── Config helpers ────────────────────────────────────────────────────────

    def _load_fields(self):
        c = self.cfg
        for k in ("host", "port", "user", "password", "database", "driver"):
            if k in self._lf:
                self._lf[k].set(c["local"].get(k, ""))

        win_auth = c["local"].get("windows_auth", False)
        self._win_auth_var.set(win_auth)
        self._on_win_auth_toggle()

        for k in ("host", "port", "user", "password", "database"):
            if k in self._rf:
                self._rf[k].set(c["remote"].get(k, ""))

        self._sync_mode.set(c["sync"]["mode"])
        self._on_mode_change()
        self._include_var.set(c["sync"].get("include_tables", ""))
        self._exclude_var.set(c["sync"].get("exclude_tables", ""))
        self._workers_var.set(str(c["sync"].get("max_workers", 4)))
        self._batch_var.set(str(c["sync"].get("batch_size", 500)))
        self._sync_mode_label.configure(text=c["sync"]["mode"])

    def _collect_config(self):
        return {
            "local": {
                "host":         self._lf["host"].get(),
                "port":         self._lf["port"].get(),
                "user":         self._lf["user"].get(),
                "password":     self._lf["password"].get(),
                "database":     self._lf["database"].get(),
                "driver":       self._lf["driver"].get(),
                "windows_auth": self._win_auth_var.get(),
            },
            "remote": {
                "host":     self._rf["host"].get(),
                "port":     self._rf["port"].get(),
                "user":     self._rf["user"].get(),
                "password": self._rf["password"].get(),
                "database": self._rf["database"].get(),
            },
            "sync": {
                "mode":           self._sync_mode.get(),
                "sync_time":      self._schedule_time.get() if hasattr(self, "_schedule_time") else "02:00",
                "include_tables": self._include_var.get(),
                "exclude_tables": self._exclude_var.get(),
                "max_workers":    int(self._workers_var.get() or 4),
                "batch_size":     int(self._batch_var.get() or 500),
            }
        }

    def _save_config(self):
        self.cfg = self._collect_config()
        save_config(self.cfg)
        messagebox.showinfo("Saved", "Configuration saved successfully.")

    def _test_connections(self):
        cfg = self._collect_config()
        results = []
        auth_desc = "Windows Auth" if cfg["local"].get("windows_auth") else "SQL Server Auth"
        try:
            c = connect_sqlserver(cfg["local"]); c.close()
            results.append(f"✔  Local SQL Server ({auth_desc}): Connected OK")
        except Exception as e:
            results.append(f"✘  Local SQL Server ({auth_desc}):\n    {e}")
        try:
            c = connect_mysql(cfg["remote"]); c.close()
            results.append("✔  Remote MySQL: Connected OK")
        except Exception as e:
            results.append(f"✘  Remote MySQL:\n    {e}")
        messagebox.showinfo("Connection Test", "\n\n".join(results))


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    if "--headless" in sys.argv:
        cfg = load_config()
        success, _ = sync_databases(cfg)
        sys.exit(0 if success else 1)
    else:
        app = SyncApp()
        app.mainloop()

if __name__ == "__main__":
    main()