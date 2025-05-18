module.exports = {
    apps: [
      {
        name: 'api-himno',
        script: 'dist/main.js',
        watch: true,
        watch_options: {
          followSymlinks: false,
          usePolling: true,
          interval: 1000,
        },
        ignore_watch: ['node_modules', 'src', 'logs'],
      },
    ],
  };
  