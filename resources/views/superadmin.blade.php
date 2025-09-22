<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Super Admin - Web Monitoring System</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        
        <!-- Tailwind CSS CDN sebagai fallback -->
        <script src="https://cdn.tailwindcss.com"></script>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/superadmin.jsx'])
    </head>
    <body class="font-sans antialiased">
        <div id="superadmin-app"></div>
        
        <!-- Debug info -->
        <script>
            console.log('SuperAdmin page loaded');
            console.log('SuperAdmin element:', document.getElementById('superadmin-app'));
        </script>
        
        <!-- Error fallback -->
        <script>
            setTimeout(() => {
                const appElement = document.getElementById('superadmin-app');
                if (!appElement || appElement.innerHTML.trim() === '') {
                    console.error('SuperAdmin React app failed to load');
                    appElement.innerHTML = '<div class="flex items-center justify-center min-h-screen bg-gray-100"><div class="text-center"><h1 class="text-2xl font-bold text-red-600">Loading Error</h1><p class="text-gray-600">Please refresh the page</p></div></div>';
                }
            }, 3000);
        </script>
    </body>
</html>