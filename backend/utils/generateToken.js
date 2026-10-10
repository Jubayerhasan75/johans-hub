import jwt from 'jsonwebtoken';

// এই ফাংশনটি একটি ইউজার আইডি নেয় এবং একটি টোকেন রিটার্ন করে
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // টোকেনটি ৩০ দিন পর এক্সপায়ার হয়ে যাবে
  });
};

export default generateToken;