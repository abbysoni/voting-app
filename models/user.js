const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findOrCreate');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique:true
      },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },

    password: {
      type: String,
    },
    googleId: String,
    displayName: String,

    role:{
        type: String,
        enum: ['voter','admin','candidate'],
        default: 'voter'
    },

    isVoted:{
        type: Boolean,
        default: false
    }

    
  });

// Pre-save middleware to hash passwords
userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
      next();
    } catch (err) {
      return next(err);
    }
  });
  
  // Method to compare passwords
  userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
      throw err;
    }
  };
  
  userSchema.plugin(findOrCreate);
  module.exports = mongoose.model('User', userSchema);
