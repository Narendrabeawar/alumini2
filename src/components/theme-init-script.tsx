export function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const theme = localStorage.getItem('alumni-theme') || 'light';
              const root = document.documentElement;
              // Safely remove classes - only remove if they exist
              if (root.classList.contains('light')) {
                root.classList.remove('light');
              }
              if (root.classList.contains('dark')) {
                root.classList.remove('dark');
              }
              // Add only dark class if theme is dark
              if (theme === 'dark') {
                root.classList.add('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}

