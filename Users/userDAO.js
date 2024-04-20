import { model } from "mongoose";
import userModel from "./userModel";

// CREATE
export const createUser = async (user) => {
    try {
        delete user._id;
        return model.create(user);
    }
    catch (error) {
        throw new Error(error.message);
    }
}

// FIND/READ USERS
export const findAllUsers = () => model.find();
export const findUserById = (id) => model.findById(id);
export const findUserByUsername = (username) => model.findOne({ username });
export const findUsersByRole = (role) => model.find({ role: role });
export const findUserByCredentials = (username, password) => model.findOne({ username, password });


// UPDATE
export const updateUser = (id, user) => model.updateOne({ _id: id }, { $set: user});

// DELETE
export const deleteUser = (id) => model.deleteOne({ _id: id });