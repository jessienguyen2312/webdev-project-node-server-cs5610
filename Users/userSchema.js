import mongoose from "mongoose";

const profilePicURL = 'https://api.dicebear.com/8.x/thumbs/svg';

const userSchema = new mongoose.Schema({
    _id: String,
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: String,
    lastName: String,
    email: String,
    role: {
        type: String,
        enum: ["ADMIN", "USER", "READER", "AUTHOR"],
        default: "READER"
    },
    dateCreated: {type: Date, default: Date.now}, 
    aboutMe: String,
    profilePicture: {type: String, default: ''}, // Default empty, set conditionally below
    follower: [String],
    following: [String],
    favoriteBook: [String], 
    OL_author_key: {type: String, unique: true}
    }, 
    { collection: "users" });

// Pre-save hook to set profile picture URL based on the role -- not sure if this'll work
userSchema.pre('save', function (next) {
    if (!this.profilePicture && this.role === "READER") {
        this.profilePicture = `${profilePicURL}?seed=${this.username}`;
    }
    next();
});

export default userSchema;

/* 
const User = mongoose.model('User', userSchema);

export default User;
 */