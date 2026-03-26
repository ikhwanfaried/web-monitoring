# SQL Server Data Synchronization

Sistem ini akan otomatis menyinkronkan data dari SQL Server ke database lokal setiap 2 jam sekali.

## Setup

### 1. Konfigurasi Database

Pastikan file `.env` sudah memiliki konfigurasi SQL Server:

```env
DB_CONNECTION2=sqlsrv
DB_HOST2=10.35.86.17
DB_DATABASE2=ilsmstest
DB_USERNAME2=sa
DB_PASSWORD2=P@ssw0rd123
```

### 2. Test Koneksi SQL Server

Jalankan command berikut untuk test koneksi:

```bash
php artisan sync:sqlserver
```

Jika berhasil, Anda akan melihat output:
```
Starting SQL Server data synchronization...
Syncing table: inventory
  📥 Found XXX records
  💾 Inserted XXX records...
  ✅ Table inventory synced successfully
...
✅ Synchronization completed successfully!
```

### 3. Setup Windows Task Scheduler (untuk auto-sync setiap 2 jam)

#### Cara 1: Menggunakan Task Scheduler GUI

1. Buka **Task Scheduler** (tekan `Win + R`, ketik `taskschd.msc`)
2. Klik **Create Basic Task**
3. Isi detail:
   - **Name**: Laravel Scheduler
   - **Description**: Run Laravel scheduler every minute
   - **Trigger**: When the computer starts
   - **Action**: Start a program
   - **Program/script**: `E:\XAMPP\htdocs\web-monitoring\scheduler.bat`
   - **Start in**: `E:\XAMPP\htdocs\web-monitoring`
4. Centang **"Run whether user is logged on or not"**
5. Edit task yang baru dibuat:
   - Tab **Triggers**: Tambah trigger baru → **Repeat task every: 1 minute**
   - Tab **Settings**: Centang **"Run task as soon as possible after a scheduled start is missed"**

#### Cara 2: Menggunakan Command Line (PowerShell - Run as Administrator)

```powershell
$action = New-ScheduledTaskAction -Execute "E:\XAMPP\htdocs\web-monitoring\scheduler.bat" -WorkingDirectory "E:\XAMPP\htdocs\web-monitoring"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration ([TimeSpan]::MaxValue)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries
Register-ScheduledTask -TaskName "Laravel Scheduler" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest
```

### 4. Verifikasi Scheduler Berjalan

Cek log file:

```bash
type storage\logs\scheduler.log
```

Atau lihat Laravel log:

```bash
type storage\logs\laravel.log
```

## Tables yang di-Sync

Command ini akan menyinkronkan tabel-tabel berikut:

- `inventory`
- `item`
- `location`
- `site`
- `invbalance`
- `invuse`
- `invuseline`

## Cara Manual Sync

Jika ingin melakukan sync manual (tanpa menunggu scheduler):

```bash
php artisan sync:sqlserver
```

## Troubleshooting

### SQL Server Driver tidak terinstall

Jika muncul error **"could not find driver"**, install SQL Server driver untuk PHP:

1. Download SQL Server drivers untuk PHP: https://docs.microsoft.com/en-us/sql/connect/php/download-drivers-php-sql-server
2. Extract file `php_sqlsrv_xx_ts.dll` dan `php_pdo_sqlsrv_xx_ts.dll`
3. Copy ke folder `E:\XAMPP\php\ext\`
4. Edit `php.ini`, tambahkan:
   ```ini
   extension=php_sqlsrv_84_ts.dll
   extension=php_pdo_sqlsrv_84_ts.dll
   ```
5. Restart Apache

### Koneksi ditolak

Pastikan:
- SQL Server dapat diakses dari IP server Anda
- Port 1433 terbuka
- User `sa` memiliki akses ke database `ilsmstest`

### Memory limit

Jika data terlalu besar, edit `php.ini`:

```ini
memory_limit = 512M
max_execution_time = 300
```

## Monitoring

### Cek Log Sync

```bash
# Lihat log scheduler
type storage\logs\scheduler.log

# Lihat log aplikasi
type storage\logs\laravel.log
```

### Cek Status Task Scheduler

```powershell
Get-ScheduledTask -TaskName "Laravel Scheduler"
```

### Stop/Start Scheduler

```powershell
# Stop
Disable-ScheduledTask -TaskName "Laravel Scheduler"

# Start
Enable-ScheduledTask -TaskName "Laravel Scheduler"
```

## Customization

### Mengubah Interval Sync

Edit `bootstrap/app.php`, ganti:

```php
// Setiap 2 jam (default)
$schedule->command('sync:sqlserver')->everyTwoHours();

// Pilihan lain:
$schedule->command('sync:sqlserver')->hourly();        // Setiap 1 jam
$schedule->command('sync:sqlserver')->everyFourHours(); // Setiap 4 jam
$schedule->command('sync:sqlserver')->daily();          // Setiap hari
$schedule->command('sync:sqlserver')->cron('0 */2 * * *'); // Custom cron
```

### Menambah Tabel Baru

Edit `app/Console/Commands/SyncSqlServerData.php`, tambahkan nama tabel di array `$tablesToSync`:

```php
$tablesToSync = [
    'inventory',
    'item',
    'location',
    'site',
    'invbalance',
    'invuse',
    'invuseline',
    'your_new_table', // Tambahkan disini
];
```
