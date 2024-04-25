import userModel from "./userModel.js";
import mongoose from "mongoose";

// CREATE
export const createUser = async (user) => {
    try {
        delete user._id;
        return userModel.create(user);
    }
    catch (error) {
        throw new Error(error.message);
    }
}

// FIND/READ USERS
export const findAllUsers = () => userModel.find();
export const findUserById = (id) => userModel.findById(id);

export const findUserByUsername = (username) => userModel.findOne({ username: username });

export const findUsersByRole = (role) => userModel.find({ role: role });
export const findUserByCredentials = (username, password) => userModel.findOne({ username, password });


// UPDATE
export const updateUser = (id, user) => userModel.updateOne({ _id: id }, { $set: user});

// DELETE
export const deleteUser = (id) => userModel.deleteOne({ _id: id });

// FOLLOW/UNFOLLOW

/* We're passing the logged-in users ID, but the person they're unfollowing's username */
// need to retrieve the unfollowing's userid to make the update
export const unfollowUser = async (userId, usernameToUnfollow) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };

        console.log("DAO LOG: Unfollowing user:", usernameToUnfollow, "from user:", userId);

        // Since you are using usernames in the following and followers array
        // No need to fetch user to unfollow by username for ID, we directly use the username
        // Perform the unfollow update on the current user
        const unfollowingUpdate = await userModel.updateOne(
            { _id: userId },
            { $pull: { following: usernameToUnfollow } },
            opts
        );

        // Also update the followers list of the user being unfollowed
        // Use the username directly to identify the user being unfollowed
        const followerUpdate = await userModel.updateOne(
            { username: usernameToUnfollow },
            { $pull: { followers: (await userModel.findById(userId)).username } },
            opts
        );

        // Check that the unfollow action modified the user
        if (unfollowingUpdate.modifiedCount === 0 || followerUpdate.modifiedCount === 0) {
            throw new Error("DAO LOG: Unfollow operation failed.");
        }

        // Fetch the updated user document for the current user
        const updatedUser = await userModel.findById(userId, null, opts);
        
        console.log("DAO LOG: Updated user to return:", updatedUser);

        await session.commitTransaction();
        return updatedUser;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

