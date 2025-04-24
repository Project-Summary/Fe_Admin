module.exports = {
  apps: [
    {
      name: 'ADMIN-contents', // Tên app trong PM2
      script: 'npm',
      args: 'run start', // Chạy lệnh build & start trên cổng 2011
      exec_mode: 'fork', // Chạy 1 instance duy nhất
      instances: 1, // Không chạy nhiều tiến trình
      autorestart: true, // Tự động restart khi có lỗi
      watch: false, // Không theo dõi file để tránh restart liên tục
      env: {
        NODE_ENV: 'production',
        PORT: 2012, // Cổng chạy production
      },
    },
  ],
};
