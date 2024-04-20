import mongoose from "mongoose";
import reviewSchema from "./schema.js";

const reviewModel = mongoose.model("ReviewModel", reviewSchema);
export default reviewModel;