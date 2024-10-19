module.exports = {
  apps: [
    {
      name: 'brawltree-backend',
      script: 'node',
      args: 'dist/main.js',
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
