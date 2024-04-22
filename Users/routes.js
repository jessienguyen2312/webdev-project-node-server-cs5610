import * as userDAO from './dao.js';

export default function UserRoutes(app) {
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
    const updateUser = async (req, res) => {
        const { id } = req.params;
        const status = await userDAO.updateUser(id, req.body);
        const currentUser = await userDAO.findUserById(id);
        res.json(currentUser);
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



}