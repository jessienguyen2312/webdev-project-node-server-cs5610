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

// FOLLOW
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
            { $pull: { follower: (await userModel.findById(userId)).username } },
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

// FOLLOW
export const followUser = async (userId, usernameToFollow) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };

        console.log("DAO LOG: Following user:", usernameToFollow, "from user:", userId);

        // Since we are using usernames in the following and followers array
        // No need to fetch user to follow by username for ID, we directly use the username
        // Perform the follow update on the current user
        const followingUpdate = await userModel.updateOne(
            { _id: userId },
            { $push: { following: usernameToFollow } },
            opts
        );

        // Also update the followers list of the user being followed
        // Use the username directly to identify the user being followed
        const followerUpdate = await userModel.updateOne(
            { username: usernameToFollow },
            { $push: { follower: (await userModel.findById(userId)).username } },
            opts
        );

        // Check that the follow action modified the user
        if (followingUpdate.modifiedCount === 0 || followerUpdate.modifiedCount === 0) {
            throw new Error("DAO LOG: Follow operation failed.");
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

    

export const addFavoriteBook = async (userId, bookId) => {
    try {
        return await userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { favoriteBook: bookId } },  // Prevents duplicate entries
            { new: true }
        );
    } catch (error) {
        throw new Error(error.message);
    }
};

export const removeFavoriteBook = async (userId, bookId) => {
    try {
        const updateResult = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { favoriteBook: bookId } },  // Removes the bookId from the favoriteBook array
            { new: true }  // Returns the updated document
        );
        if (!updateResult) {
            throw new Error("User not found.");
        }
        return updateResult;
    } catch (error) {
        throw new Error(`Error removing favorite book: ${error.message}`);
    }
};