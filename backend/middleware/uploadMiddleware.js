import multer from 'multer';

// Multer কে বলা হচ্ছে যে ফাইলটি সার্ভারের ডিস্কে সেভ না করে,
// মেমোরিতে (RAM) রাখো, যাতে আমরা এটি সরাসরি Cloudinary-তে পাঠাতে পারি।
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB ফাইল সাইজ লিমিট
  },
  fileFilter: (req, file, cb) => {
    // শুধু ইমেজ ফাইল অ্যালাউ করা হচ্ছে
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

export default upload;