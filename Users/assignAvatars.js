import { MongoClient } from 'mongodb';

// I created this function to assign avatars to existing readers in our db. 
// Probably don't need this anymore since we'll handle it in the front end.

// MongoDB Atlas Connection URL with the database name included
const url = 'mongodb+srv://leo:bookazondb@cluster0.kmrx6lx.mongodb.net/yourDatabaseName';
const client = new MongoClient(url);

async function assignAvatars() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db('bookazon');  
        const collection = db.collection('users');
       

        // Base URL for the DiceBear API and thumbs == the style we're going with for now
        const baseURL = 'https://api.dicebear.com/8.x/thumbs/svg';

        // Find all 'READER' users
        const cursor = collection.find({ role: 'READER' });

        // Iterate over the cursor to update each user
        for await (const user of cursor) {
            const avatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${user.username}`;
            await collection.updateOne(
                { _id: user._id },
                { $set: { profilePicture: avatarUrl } }
            );
        }

        console.log("Profile pictures updated for all READER users");
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

assignAvatars();
