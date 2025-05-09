
const { clerkClient } = require('@clerk/express');
const User = require('../models/User');

exports.registerUser = async (req, res) => {    
    try {
        const clerkUsers = await clerkClient.users.getUserList();

        for (let i = 0; i < clerkUsers.data.length; i++) {
            const clerkUser = clerkUsers.data[i];
            const email = clerkUser.emailAddresses[0]?.emailAddress;

            // Check if user already exists in MongoDB
            const existingUser = await User.findOne({ userId: clerkUser.id });
            
            if (!existingUser) {
                const newUser = new User({
                    userId: clerkUser.id,
                    userObject: clerkUser  // store the whole object
                });

                await newUser.save();
                console.log(`Saved new user: ${email}`);
            } else {
                console.log(`User already in DB: ${email}`);
            }
        }

        res.status(201).json({ message: 'Synced users successfully' });
    } catch (error) {
        console.error('Error syncing users:', error);
        res.status(500).json({ message: 'Failed to register users' });
    }
};
