<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah User - SIMTELOG</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="{{ asset('build/assets/app-DG5Ajqu4.css') }}">
</head>
<body>
    <div id="add-user-root"></div>
    
    <!-- Debug info -->
    <script>
        console.log('Page loaded');
        console.log('Root element:', document.getElementById('add-user-root'));
    </script>
    
    <script type="module" src="{{ asset('build/assets/app-CzXmxLjV.js') }}"></script>
</body>
</html>
