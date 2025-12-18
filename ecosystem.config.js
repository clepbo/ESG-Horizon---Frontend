module.exports = {
  apps: [
    {
      name: "esg-frontend-prod",
      script: "./server.js",
      // Change 'max' to 1 for a 1vCPU server to save resources
      instances: 1, 
      // 'fork' mode is usually more stable than 'cluster' for single-instance setups
      exec_mode: "fork", 
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "500M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};