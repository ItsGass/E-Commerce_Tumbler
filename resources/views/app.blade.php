<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&display=swap"
            rel="stylesheet"
        >

        <meta name="theme-color" content="#FBF3E8">

        {{-- Pre-paint theme: resolve stored preference before the bundle loads so
             there is no flash of the wrong theme. Keep this in sync with
             resources/js/stores/useThemeStore.ts. --}}
        <script>
            (function () {
                var resolved = 'light';

                try {
                    var stored = window.localStorage.getItem('tumbler-theme');
                    var preference =
                        stored === 'light' || stored === 'dark' || stored === 'system'
                            ? stored
                            : 'light';

                    resolved =
                        preference === 'system'
                            ? window.matchMedia('(prefers-color-scheme: dark)').matches
                                ? 'dark'
                                : 'light'
                            : preference;
                } catch (error) {
                    resolved = 'light';
                }

                var root = document.documentElement;
                root.setAttribute('data-theme', resolved);
                root.style.colorScheme = resolved;

                var meta = document.querySelector('meta[name="theme-color"]');
                if (meta) {
                    meta.setAttribute('content', resolved === 'dark' ? '#1E1611' : '#FBF3E8');
                }
            })();
        </script>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
