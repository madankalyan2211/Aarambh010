const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  // Student/Teacher specific fields
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  teachingCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  // Teacher-Student relationships
  enrolledTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // References to teacher users
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // References to student users
  }],
  // Profile information
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  // Learning statistics for students
  learningStreak: {
    type: Number,
    default: 0,
  },
  totalXP: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date
  }],
  // Account settings
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  // OTP verification
  otp: {
    code: String,
    expiresAt: Date,
  },
  // Auth0 integration
  auth0Id: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
  },
  // Google OAuth integration
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
  },
  // Firebase authentication
  firebaseId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
  },
  // MFA (Multi-Factor Authentication) support
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otp || !this.otp.code) {
    return false;
  }
  
  if (new Date() > this.otp.expiresAt) {
    return false; // OTP expired
  }
  
  return this.otp.code === candidateOTP;
};

// Method to get public profile
userSchema.methods.toPublicProfile = function() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    isVerified: this.isVerified,
    learningStreak: this.learningStreak,
    totalXP: this.totalXP,
    badges: this.badges,
    teachingCourses: this.teachingCourses || [],
    enrolledCourses: this.enrolledCourses || [],
    enrolledTeachers: this.enrolledTeachers || [],
    students: this.students || [],
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;