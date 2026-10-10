import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: { type: String, required: true, minlength: 6 },
  // --- ⛔️ Ensure isAdmin defaults to false ---
  isAdmin: { type: Boolean, required: true, default: false },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// --- Password Hashing Middleware (Before saving) ---
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new).
  // Without this return, an unchanged (already-hashed) password gets
  // re-hashed on every save, permanently locking the user out.
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Password Comparison Method ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;