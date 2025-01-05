module.exports = {
  apps: [
    {
      name: 'brawltree-api',
      script: 'node',
      args: 'api-request.js',
      autorestart: false,
      watch: false
    }
  ]
};
