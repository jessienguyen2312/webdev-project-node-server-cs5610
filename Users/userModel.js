import mongoose from "mongoose";
import userSchema from "./userSchema";

const userModel = mongoose.model('userModel', userSchema);
export default userModel;