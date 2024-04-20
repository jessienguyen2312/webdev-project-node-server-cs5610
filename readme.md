# README
for some notes/tips

## Making Modules / Entities
When making new Modules/Entities (Reviews, Users, etc.), the logical order to build out the files is: 

* schema.js
* model.js
* dao.js
* routes.js

### Schemas
### Models
### DAOs
* Maybe have some more try/catch blocks? 

### Routes
When making routes - be sure to consider the *order* of routes, since that can affect which function is executed. ex: api/users/:id and api/users/:username --> one of these won't work. 

Solution: for now:  either consider the order, use pass() (or whatever its called), or implement URIs for different functionalities to separate concerns. 

Some other later considerations could be: 

* restricting certain routes/apis to users based on types. This might be a good way to manage ADMIN actions, or user-specific actions. Such as: 
``
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}

app.get('/api/users', isAdmin, findAllUsers);
``

* limiting data exposure. Maybe we don't want send back data like passwords, DOB? can send back limited data. Ex: 
``
export const findAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, 'username email role'); // Only fetch username, email, and role
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
``

* use pagination and limiting for queries that return large amounts of data 

#### When we're done implementing all of the module files:
* import the routes into App.js 
* mount the routes onto the application (i.e. UserRoutes(App))