import userModel from "./userModel.js";

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