import * as userDAO from './dao.js';
import userModel from './userModel.js';

export default function UserRoutes(app) {
    app.get('/test-user-model', async (req, res) => {
        try {
            const users = await userModel.find();
            res.json(users);
        } catch (error) {
            console.error('Test userModel failed:', error);
            res.status(500).send('Error testing userModel');
        }
    });

    // CREATE
    const createUser = async (req, res) => {
        const user = await userDAO.createUser(req.body);
        res.json(user);
    };
    app.post('/api/users', createUser);


    // READ / FIND
    const findAllUsers = async (req, res) => {
        const { role } = req.query;
        if (role) {
            const users = await userDAO.findUsersByRole(role);
            res.json(users);
        } else {
            const users = await userDAO.findAllUsers();
            res.json(users);
        }
    };
    app.get('/api/users', findAllUsers);

    // find role == author
    const findAllAuthors = async (req, res) => {
        const users = await userDAO.findUsersByRole('AUTHOR');
        res.json(users);
    };

    const findUserById = async (req, res) => {
        const { id } = req.params;
        const user = await userDAO.findUserById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    };
    app.get('/api/users/:id', findUserById);

    /* We might one day want to switch to query strings instead --- may allow for searching by other fields */
    const findUserByUsername = async (req, res) => {
        const { username } = req.params;

        try {
            const user = await userDAO.findUserByUsername(username);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
    app.get('/api/users/find/:username', findUserByUsername);

    // UPDATE
    // const updateUser = async (req, res) => {
    //     const { id } = req.params;
    //     const status = await userDAO.updateUser(id, req.body);
    //     const currentUser = await userDAO.findUserById(id);
    //     res.json(currentUser);
    // };
    const updateUser = async (req, res) => {
        const { id } = req.params;
        const user = req.body;
        console.log('Updating user with ID:', id);


        // Log the data received in request body to verify it's what you expect
        console.log('Data received for update:', user);

        const status = await userDAO.updateUser(id, user);
        console.log('Update status:', status);
        req.session['currentUser'] = user;
        console.log('User Updated', req.session);

        console.log('Updated User:', req.session['currentUser']);
        res.json(user);
        // }

    };
    app.put('/api/users/:id', updateUser);

    // DELETE
    const deleteUser = async (req, res) => {
        const { id } = req.params;
        const status = await userDAO.deleteUser(id);
        res.json(status);
    };
    app.delete('/api/users/:id', deleteUser);

    // SIGNIN/SIGNOUT
    const signin = async (req, res) => {
        const { username, password } = req.body;
        const user = await userDAO.findUserByCredentials(username, password);
        if (user) {
            req.session['currentUser'] = user;

            console.log('Session set:', req.session);
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    };
    app.post('/api/users/signin', signin);

    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };
    app.post('/api/users/signout', signout);

    // PROFILE
    const profile = (req, res) => {
        const currentUser = req.session['currentUser'];
        if (currentUser) {
            res.json(currentUser);
        } else {
            res.status(401).json({ message: 'Not logged in' });
        }
    };
    app.post("/api/users/profile", profile);  // feel like this should be app.get


    const session = (req, res) => {
        // console.log('Session accessed:', req.session);
        // Check if currentUser exists in the session
        const currentUser = req.session['currentUser'];
        console.log(`profile session: ${req.session['currentUser']}`)
        if (!currentUser) {
            // If currentUser is not found, send a 404 status
            return res.status(404).json({ message: "user not logged in" });
        }
        // If currentUser exists, send it as a JSON response
        res.json(currentUser);
    };

    app.get("/api/session", session);

    // Unfollow
    const unfollowUser = async (req, res) => {
        try {
            const { userId } = req.params; // ID of the user performing the unfollow
            const { usernameToUnfollow } = req.body; // Username of the user to be unfollowed

            console.log("ROUTE LOG: Received unfollow request:", { userId, usernameToUnfollow }); // Debug log to confirm received data

            const result = await userDAO.unfollowUser(userId, usernameToUnfollow);
            if (result) {
                res.json({ message: 'Unfollowed successfully', user: result });
            } else {
                res.status(404).send('Unfollow failed');
            }
        } catch (error) {
            console.error('ROUTE LOG: Failed to unfollow: ', error);
            res.status(500).send('Internal Server Error');
        }
    };
    app.put('/api/users/:userId/unfollow', unfollowUser);

    // Follow
    const followUser = async (req, res) => {
        try {
            const { userId } = req.params; // ID of the user performing the follow
            const { usernameToFollow } = req.body; // Username of the user to be followed

            console.log("ROUTE LOG: Received follow request:", { userId, usernameToFollow }); // Debug log to confirm received data

            const result = await userDAO.followUser(userId, usernameToFollow);
            if (result) {
                res.json({ message: 'Followed successfully', user: result });
            } else {
                res.status(404).send('Follow failed');
            }
        } catch (error) {
            console.error('ROUTE LOG: Failed to follow: ', error);
            res.status(500).send('Internal Server Error');
        }
    };
    app.put('/api/users/:userId/follow', followUser);




    // Route to add a book to a user's favorites
    app.put('/api/users/:id/favorite', async (req, res) => {
        const { id } = req.params;
        const { bookId } = req.body;  // Assuming the ID of the book to be added is passed in the request body

        try {
            const updatedUser = await userDAO.addFavoriteBook(id, bookId);
            if (updatedUser) {
                req.session['currentUser'] = updatedUser;
                res.json(updatedUser);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error adding favorite book:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });


    app.delete('/api/users/:userId/favorites/:bookId', async (req, res) => {
        const { userId, bookId } = req.params;
        console.log(bookId)

        try {

            const updatedUser = await userDAO.removeFavoriteBook(userId, bookId);

            req.session['currentUser'] = updatedUser;
            res.json({
              updatedUser
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

}