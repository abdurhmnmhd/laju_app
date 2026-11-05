const path = require('path');
module.exports = {
  apps: [{
    name: 'laju-backend',
    script: path.join(__dirname, 'src/index.js'),
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    env: { NODE_ENV: 'production' }
  }]
};
