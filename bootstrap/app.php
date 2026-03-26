<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
// use Illuminate\Console\Scheduling\Schedule; // Commented out - SQL Server sync not active yet

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    // DISABLED: SQL Server Sync Scheduler
    // Uncomment this when SQL Server access is granted
    // ->withSchedule(function (Schedule $schedule) {
    //     // Sync SQL Server data every 2 hours
    //     $schedule->command('sync:sqlserver')
    //              ->everyTwoHours()
    //              ->withoutOverlapping()
    //              ->runInBackground();
    // })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
