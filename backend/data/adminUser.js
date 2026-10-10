import bcrypt from 'bcryptjs';

// Admin credentials come from environment variables so no password
// ever lives in the source code. Set these in backend/.env before
// running `npm run data:import`:
//   ADMIN_NAME=Your Name
//   ADMIN_EMAIL=admin@example.com
//   ADMIN_PASSWORD=a-strong-password
const adminUser = [
  {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
      ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
      : undefined,
    isAdmin: true,
  },
];

export default adminUser;
