module.exports = {
  apps: [
    {
      name: 'bt-backend',
      script: 'node',
      args: 'dist/main.js',
      autorestart: false,
      watch: false,
      error_file: 'logs/errors/brawl-tree-backend.log',
      out_file: 'logs/outs/brawl-tree-backend.log',
      log_file: 'logs/brawl-tree-backend.log',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
