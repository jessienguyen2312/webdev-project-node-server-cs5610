import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    username: { type: String, required: true },
    bookId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5},
    text: String,
    datePosted: { type: Date, default: Date.now },
    flagged: { type: Boolean, default: false },
    likes: { type: Number, default: 0}
    },
    { collection: "reviews" });

export default reviewSchema;