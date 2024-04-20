import mongoose from "mongoose";
import reviewSchema from "./schema";

const reviewModel = mongoose.model("ReviewModel", reviewSchema);
export default reviewModel;