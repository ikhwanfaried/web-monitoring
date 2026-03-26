# SQL Server Data Synchronization

> **⚠️ STATUS: DISABLED - Prepared for Future Use**
> 
> Fitur ini sudah disiapkan tapi **TIDAK AKTIF** karena akses SQL Server masih terbatas.
> File-file ini tidak akan mempengaruhi jalannya aplikasi saat ini.

## 📋 Deskripsi

Command Laravel untuk sinkronisasi data dari SQL Server ke database lokal setiap 2 jam sekali.
Data akan di-sync untuk tabel: `inventory`, `item`, `location`, `site`, `invbalance`, `invuse`, `invuseline`.

## 🔧 Konfigurasi

### 1. Database Configuration (Sudah Ada)
File `.env` sudah memiliki konfigurasi SQL Server:
```env
DB_CONNECTION2=sqlsrv
DB_HOST2=10.35.86.17
DB_DATABASE2=ilsmstest
DB_USERNAME2=sa
DB_PASSWORD2=P@ssw0rd123
```

### 2. Files Yang Sudah Disiapkan

- ✅ `app/Console/Commands/SyncSqlServerData.php` - Command untuk sync data (DISABLED)
- ✅ `bootstrap/app.php` - Scheduler (commented out/disabled)
- ✅ `scheduler.bat` - Windows Task Scheduler helper (siap digunakan)
- ✅ `SQLSERVER_SYNC_README.md` - Dokumentasi ini

## 🚀 Cara Mengaktifkan (Ketika Akses SQL Server Sudah Diberikan)

### Step 1: Test Manual Command
```powershell
# Test apakah koneksi SQL Server berhasil
php artisan sync:sqlserver
```

Jika berhasil, akan muncul:
```
✅ SQL Server connection successful!
🔄 Syncing table: inventory...
✅ Synced X records to inventory
...
```

Jika gagal (expected saat ini):
```
❌ SQL Server connection not configured in database.php
⚠️  This command is prepared for future use.
```

### Step 2: Enable Automatic Scheduler
Edit file `bootstrap/app.php`, uncomment bagian ini:

```php
use Illuminate\Console\Scheduling\Schedule; // Uncomment this line

// ...

->withSchedule(function (Schedule $schedule) {
    // Sync SQL Server data every 2 hours
    $schedule->command('sync:sqlserver')
             ->everyTwoHours()
             ->withoutOverlapping()
             ->runInBackground();
})
```

### Step 3: Setup Windows Task Scheduler

**Opsi A: Menggunakan Windows Task Scheduler GUI**

1. Buka Task Scheduler (tekan Win + R, ketik `taskschd.msc`)
2. Klik "Create Basic Task"
3. Name: "Laravel Scheduler - Web Monitoring"
4. Trigger: Daily
5. Start time: 00:00 (midnight)
6. Action: Start a program
7. Program/script: Browse ke `scheduler.bat` di folder project
8. Finish

**Opsi B: Menggunakan Command Line (Admin PowerShell)**

```powershell
# Jalankan sebagai Administrator
schtasks /create /tn "LaravelScheduler" /tr "E:\XAMPP\htdocs\web-monitoring\scheduler.bat" /sc minute /mo 1 /ru SYSTEM
```

### Step 4: Verifikasi Scheduler Berjalan

```powershell
# Cek log Laravel
tail -f storage/logs/laravel.log

# Atau cek Task Scheduler history
```

## 📊 Cara Kerja

1. **Every 2 hours**, Laravel Scheduler menjalankan command `sync:sqlserver`
2. Command membaca data dari **SQL Server** (koneksi `sqlsrv`)
3. Data di-truncate dan di-insert ulang ke **database lokal** (SQLite/MySQL)
4. Log disimpan di `storage/logs/laravel.log`

## 🛠️ Troubleshooting

### Error: SQL Server connection failed
```bash
# Pastikan SQL Server accessible
ping 10.35.86.17

# Test koneksi via PHP
php artisan tinker
>>> DB::connection('sqlsrv')->getPdo();
```

### Scheduler tidak jalan
```bash
# Test scheduler manual
php artisan schedule:run

# Cek task Windows
schtasks /query /tn "LaravelScheduler"

# Lihat log
cat storage/logs/laravel.log
```

## 📝 Log Output

Setiap sync akan menghasilkan log seperti ini:

```
[2024-11-07 10:00:00] local.INFO: SQL Server sync started
[2024-11-07 10:00:01] local.INFO: Synced 1234 records to inventory
[2024-11-07 10:00:02] local.INFO: Synced 567 records to item
[2024-11-07 10:00:03] local.INFO: SQL Server sync completed successfully in 3.45 seconds
```

## ⚙️ Customization

### Ubah Interval Sync
Edit `bootstrap/app.php`:
```php
// Every hour
$schedule->command('sync:sqlserver')->hourly();

// Every 30 minutes
$schedule->command('sync:sqlserver')->everyThirtyMinutes();

// Custom cron
$schedule->command('sync:sqlserver')->cron('0 */2 * * *');
```

### Tambah/Hapus Table
Edit `app/Console/Commands/SyncSqlServerData.php`:
```php
$tablesToSync = [
    'inventory',
    'item',
    // tambahkan table baru di sini
];
```

## 🚫 Disable Kembali

Jika ingin disable lagi:

1. Comment scheduler di `bootstrap/app.php`
2. Hapus Windows Task:
   ```powershell
   schtasks /delete /tn "LaravelScheduler" /f
   ```

## 📌 Notes

- ⚠️ Command ini menggunakan **TRUNCATE dan INSERT**, bukan UPDATE
- ⚠️ Data lokal akan diganti total setiap sync
- ⚠️ Pastikan tidak ada foreign key constraint yang strict
- ✅ Ada protection `withoutOverlapping()` agar tidak sync bersamaan
- ✅ Berjalan di background dengan `runInBackground()`

## 🔗 References

- [Laravel Task Scheduling](https://laravel.com/docs/11.x/scheduling)
- [Windows Task Scheduler](https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)
