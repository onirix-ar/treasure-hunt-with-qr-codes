import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';


const regionalFunctions = functions.region('europe-west1');
admin.initializeApp();

const EMAIL_REG_EXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const CONSTANTS = {
    COLLECTION_USERS: 'USERS',
    COLLECTION_EVENTS: 'EVENTS',
    COLLECTION_BOOTHS: 'BOOTHS',
    SECRET: 'AUTHENTICATION TOKEN',
    SENDGRID_API_KEY: 'EMAIL API KEY',
    IH_HOST: 'YOUR CUSTOM DOMAIN',
    EMAIL_FROM: 'CONFIRMATION EMAIL'
}

/* CLASSES */

class User {
    public firstName: string;
    public lastName: string;
    public company: string;
    public jobTitle: string;
    public email: string;
    public hash: string;
    public playedGames: PlayedGame[];
}

class Booth {
    public id: string;
    public name: string;
    public description: string;
    public logoUrl: string;
    public location: string;
    public onirixProjectOid: string;
    public onirixSceneOid: string;
}

class PlayedGame {
    public userId: string;
    public boothId: string;
    public score: number;
    public playedAt: string;
}

class IHEvent {
    public name: string;
    public description: string;
    public logoUrl: string;
    public booths: any[];
}

/* FIREBASE FUNCTIONS */
export const mailAvailable = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }
    try {
        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Register data is required');
        }
        if (!isEmail(data.body.email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Email format is invalid');
        }

        // Check if email is taken
        const userSnapshot = await admin.firestore()
            .collection(CONSTANTS.COLLECTION_USERS)
            .where('email', '==', data.body.email)
            .get();
        if (!userSnapshot.empty) {
            throw new functions.https.HttpsError('invalid-argument', 'Email already taken');
        }
        return {};
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});


/*
*  Registers a new user and returns an auth token (JWT)
*/
export const register = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Register data is required');
        }
        if (!isEmail(data.body.email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Email format is invalid');
        }
        if (!data.body.firstName || 1 > data.body.firstName.trim().length) {
            throw new functions.https.HttpsError('invalid-argument', 'First name is required');
        }
        if (!data.body.lastName || 1 > data.body.lastName.trim().length) {
            throw new functions.https.HttpsError('invalid-argument', 'Last name is required');
        }
        if (!data.body.company || 1 > data.body.company.trim().length) {
            throw new functions.https.HttpsError('invalid-argument', 'Company is required');
        }
        if (!data.body.jobTitle || 1 > data.body.jobTitle.trim().length) {
            throw new functions.https.HttpsError('invalid-argument', 'Job title is required');
        }
        if (!data.body.password || data.body.password.length < 6) {
            throw new functions.https.HttpsError('invalid-argument', 'Password format is invalid');
        }

        let authToken = '';
        let user = null;

        functions.logger.info(`Attempting to register user ${data.body.name} with email ${data.body.email}`);

        await admin.firestore().runTransaction(async t => {

            // Check if email is taken
            const userSnapshot = await admin.firestore()
                .collection(CONSTANTS.COLLECTION_USERS)
                .where('email', '==', data.body.email)
                .get();

            if (!userSnapshot.empty) {
                throw new functions.https.HttpsError('permission-denied', 'Email already taken');
            }
            else {
                // If user doesn't exist, create it
                user = new User();
                user.firstName = data.body.firstName;
                user.firstName = data.body.firstName;
                user.lastName = data.body.lastName;
                user.company = data.body.company;
                user.jobTitle = data.body.jobTitle;
                user.email = data.body.email;
                const bcrypt = await import('bcrypt');
                user.hash = bcrypt.hashSync(data.body.password, 10);
                user.playedGames = [];
                const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).add(Object.assign({}, user));
                const jwt = await import('jsonwebtoken');
                authToken = jwt.sign({ userId: userRef.id }, CONSTANTS.SECRET);
                delete user.hash;
            }

        });

        functions.logger.info(`User ${data.body.name} with email ${data.body.email} was registered`);
        return { user: user, authToken: authToken };

    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
*  Logs in a user with email/password returning an auth token (JWT)
*/
export const login = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Login data is required');
        }
        if (!isEmail(data.body.email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Email format is invalid');
        }
        if (!data.body.password) {
            throw new functions.https.HttpsError('invalid-argument', 'Password format is invalid');
        }


        functions.logger.info(`Attempting to login user with email ${data.body.email}`);

        // Get user snapshot
        const userSnapshot = await admin.firestore()
            .collection(CONSTANTS.COLLECTION_USERS)
            .where('email', '==', data.body.email)
            .get();

        // Ensure user exists for given email
        if (userSnapshot.empty) {
            throw new functions.https.HttpsError('permission-denied', 'Invalid credentials');
        }
        else {
            const user = new User();
            let userId = null;
            userSnapshot.docs.map(doc => {
                Object.assign(user, doc.data());
                userId = doc.id;
            });
            // Check if password match
            const bcrypt = await import('bcrypt');
            if (bcrypt.compareSync(data.body.password, user.hash)) {
                // If password match, generate auth token
                const jwt = await import('jsonwebtoken');
                const authToken = jwt.sign({ userId: userId }, CONSTANTS.SECRET);

                functions.logger.info(`User with email ${data.body.email} was logged in`);
                delete user.hash;
                return { user: user, authToken: authToken };
            }
            else {
                throw new functions.https.HttpsError('permission-denied', 'Invalid credentials');
            }
        }

    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Requests a password reset
*/
export const requestPasswordReset = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        const email = data.body?.email;
        if (!email || !isEmail(email)) {
            throw new functions.https.HttpsError('invalid-argument', 'A valid email is required');
        }
        else {

            functions.logger.info(`Attempting to generate a password reset link for user with email ${data.body.email}`);

            // Get user snapshot
            const userSnapshot = await admin.firestore()
                .collection(CONSTANTS.COLLECTION_USERS)
                .where('email', '==', data.body.email)
                .get();

            // Ensure user exists for given email
            if (userSnapshot.empty) {
                throw new functions.https.HttpsError('permission-denied', 'No account with that email exists');
            }

            // Generate password reset code
            const cryptoJS = await import("crypto-js");
            const plain = `${(new Date()).toISOString()}#${email}`;
            const code = cryptoJS.AES.encrypt(plain, CONSTANTS.SECRET).toString();

            // Send email with password reset link
            try {
                const sendgrid = await import("@sendgrid/mail");
                sendgrid.setApiKey(CONSTANTS.SENDGRID_API_KEY);
                const mail = {
                    to: email,
                    from: CONSTANTS.EMAIL_FROM,
                    subject: `Treasure Hunt - Password reset request`,
                    html: getPasswordResetRequestEmailHtml(encodeURIComponent(code), CONSTANTS.IH_HOST)
                };
                await sendgrid.send(mail);
                functions.logger.info(`Password reset link was sent to ${data.body.email}`);
            } catch (error) {
                functions.logger.error(`Error sending reset link`, error);
            }
            return {};
        }
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Reset user's password
*/
export const resetPassword = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        const code = data.body?.code;
        if (!code) {
            throw new functions.https.HttpsError('invalid-argument', 'Code is required');
        }

        functions.logger.info(`Attempting to reset password with code ${data.body.code}`);

        // Decrypt password reset code
        const cryptoJS = await import("crypto-js");
        const decrypted = cryptoJS.AES.decrypt(code, CONSTANTS.SECRET).toString(cryptoJS.enc.Utf8);
        const chunks = decrypted.split("#");
        if (chunks.length !== 2) {
            throw new functions.https.HttpsError('invalid-argument', 'Code is malformed');
        }

        // Check code has not expired
        const requestDate = new Date(chunks[0]).getTime();
        const email = chunks[1];
        const tenMinutes = 1000 * 60 * 10;
        if (requestDate + tenMinutes < (new Date().getTime())) {
            throw new functions.https.HttpsError('permission-denied', 'Password request link expired');
        }

        // Get user snapshot
        const userSnapshot = await admin.firestore()
            .collection(CONSTANTS.COLLECTION_USERS)
            .where('email', '==', email)
            .get();

        // Ensure user exists for given email
        if (userSnapshot.empty) {
            throw new functions.https.HttpsError('permission-denied', 'User with provided email does not exist');
        }

        // Generate a new random password
        const crypto = await import("crypto");
        const newPassword = crypto.randomBytes(8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
        const bcrypt = await import("bcrypt");
        const newHash = bcrypt.hashSync(newPassword, 10);

        // Update password hash
        await userSnapshot.docs[0].ref.update({ hash: newHash });

        // Send email to notify user
        try {
            const sendgrid = await import("@sendgrid/mail");
            sendgrid.setApiKey(CONSTANTS.SENDGRID_API_KEY);
            const mail = {
                to: email,
                from: CONSTANTS.EMAIL_FROM,
                subject: `Treasure Hunt - New password`,
                html: getPasswordResetEmailHtml(newPassword)
            };
            await sendgrid.send(mail);
            functions.logger.info(`A new password was generated and sent to ${email}`);
        } catch (error) {
            functions.logger.error(`Error sending new password`, error);
        }
        return {};
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Get event
*/
export const getEvent = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    try {
        // Get event snapshot
        const eventsSnapshot = await admin.firestore().collection(CONSTANTS.COLLECTION_EVENTS).get();
        if (eventsSnapshot.empty) {
            throw new functions.https.HttpsError('not-found', 'Event not found.');
        }
        const ihEvents = eventsSnapshot.docs.map(doc => Object.assign(new IHEvent(), doc.data()));
        const ihEvent = ihEvents[0];
        ihEvent.booths = [];

        // Get booths
        const boothsSnapshot = await admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).get();
        if (!eventsSnapshot.empty) {
            ihEvent.booths = boothsSnapshot.docs.map(doc => Object.assign(new Booth(), doc.data()));
            ihEvent.booths.sort((a, b) => a.name.trim().toLocaleUpperCase().localeCompare(b.name.trim(), undefined, { numeric: true, sensitivity: 'base' }));
        }
        return ihEvent;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Update event
*/
export const saveEvent = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    try {
        // Restrict access to admin
        const userId = await checkAuth(data.auth);
        if (userId !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Admin authentication required');
        }

        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Event data is required');
        }
        if (null == data.body.name || 1 > data.body.name.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Name is required');
        }

        functions.logger.info(`Attempting to update a event: ${data.body.name}`);

        let ihEvent: any = null;
        await admin.firestore().runTransaction(async t => {
            const ihEventsSnapshot = await admin.firestore().collection(CONSTANTS.COLLECTION_EVENTS).get();
            let ihEventRef = null;
            if (!ihEventsSnapshot.empty) {
                ihEventRef = ihEventsSnapshot.docs[0].ref;
            } else {
                ihEventRef = await admin.firestore().collection(CONSTANTS.COLLECTION_EVENTS).add({});
            }

            ihEvent = {
                name: data.body.name
            }
            if (data.body.logoImage && data.body.logoImage.fileName && data.body.logoImage.base64) {
                const tokens = data.body.logoImage.fileName.split('.');
                const filename = `${ihEventRef.id}.${tokens[tokens.length - 1].toLocaleLowerCase()}`;
                ihEvent['logoUrl'] = await uploadFile('sh-event', filename, data.body.logoImage.base64);
            }

            await t.update(ihEventRef, Object.assign({}, ihEvent));
        });
        return ihEvent;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Create booth
*/
export const saveBooth = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }
    try {
        // Restrict access to admin
        const userId = await checkAuth(data.auth);
        if (userId !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Admin authentication required');
        }

        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Booth data is required');
        }
        if (null == data.body.name || 1 > data.body.name.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Name is required');
        }
        if (null == data.body.description || 1 > data.body.description.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Description is required');
        }
        if (null == data.body.location || 1 > data.body.location.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Location is required');
        }
        if (null == data.body.onirixProjectOid || 1 > data.body.onirixProjectOid.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Onirix project is required');
        }
        if (null == data.body.onirixSceneOid || 1 > data.body.onirixSceneOid.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Onirix scene is required');
        }
        let boothId = data.body.id ? data.body.id : null;

        functions.logger.info(`Attempting to update a booth: ${data.body.name}`);
        await admin.firestore().runTransaction(async t => {
            let boothRef = null;
            if (boothId) {
                boothRef = admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).doc(boothId);
                if (!(await boothRef.get()).exists) {
                    throw new functions.https.HttpsError('not-found', 'Booth not found.');
                }
            } else {
                boothRef = await admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).add({});
                boothId = boothRef.id;
            }

            const booth = new Booth();
            booth.id = boothRef.id;
            booth.name = data.body.name;
            booth.description = data.body.description;
            booth.location = data.body.location;
            booth.onirixProjectOid = data.body.onirixProjectOid;
            booth.onirixSceneOid = data.body.onirixSceneOid;

            if (data.body.logoImage && data.body.logoImage.fileName && data.body.logoImage.base64) {
                const tokens = data.body.logoImage.fileName.split('.');
                const filename = `${boothRef.id}.${tokens[tokens.length - 1].toLocaleLowerCase()}`;
                booth.logoUrl = await uploadFile('booth', filename, data.body.logoImage.base64);
            }
            await t.update(boothRef, Object.assign({}, booth));
        });
        const temp = admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).doc(boothId);
        const savedBooth = (await temp.get()).data();
        return savedBooth;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Delete booth
*/
export const deleteBooth = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    const userId = await checkAuth(data.auth);
    if (userId !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin authentication required');
    }

    // Validate input
    if (null == data.body || null == data.body.id || 1 > data.body.id.length) {
        throw new functions.https.HttpsError('invalid-argument', 'Booth id is required');
    }

    try {
        const boothRef = admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).doc(data.body.id);
        if (!(await boothRef.get()).exists) {
            throw new functions.https.HttpsError('not-found', 'Booth not found.');
        } else {
            await boothRef.delete();
        }
        return {};
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Delete game play
*/
export const deleteGame = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    const adminId = await checkAuth(data.auth);
    if (adminId !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin authentication required');
    }

    // Validate input
    if (null == data.body || null == data.body.userId || 1 > data.body.userId.length) {
        throw new functions.https.HttpsError('invalid-argument', 'User id is required');
    }

    if (null == data.body || null == data.body.boothId || 1 > data.body.boothId.length) {
        throw new functions.https.HttpsError('invalid-argument', 'Booth id is required');
    }

    const userId = data.body.userId;
    try {
        await admin.firestore().runTransaction(async t => {
            const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).doc(userId);
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new functions.https.HttpsError('not-found', `User ${userId} not found.`);
            }
            const user: User = userDoc.data() as User;
            let gamePlayed = null;
            if (null != user.playedGames && 0 < user.playedGames.length) {
                gamePlayed = user.playedGames.find((g: PlayedGame) => g.boothId === data.body.boothId);
            }

            if (null == gamePlayed) {
                throw new functions.https.HttpsError('not-found', `User ${userId} didn't play this booth ${data.body.boothId}.`);
            }
            if (1 < user.playedGames.length) {
                await t.update(userRef, { playedGames: firestore.FieldValue.arrayRemove(gamePlayed) });
                functions.logger.info(`Game deleted for user ${userId}`, gamePlayed);
            } else {
                await t.delete(userRef);
                functions.logger.info(`User ${userId} deleted`, user);
            }

        });
        return {};
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Register game play
*/
export const saveGame = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    const userId = await checkAuth(data.auth);
    if (null == userId) {
        throw new functions.https.HttpsError('permission-denied', 'User authentication required');
    }
    // Validate input
    if (null == data.body || null == data.body.boothId || 1 > data.body.boothId.length) {
        throw new functions.https.HttpsError('invalid-argument', 'Booth id is required');
    }
    if (null == data.body || null == data.body.score || Number.isNaN(Number(data.body.score))) {
        throw new functions.https.HttpsError('invalid-argument', 'Score is required');
    }

    try {
        let playedGame = null;
        // Get user snapshot
        await admin.firestore().runTransaction(async t => {
            const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).doc(userId);
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'User not found.');
            }

            const user: User = userDoc.data() as User;
            if (null != user.playedGames && 0 < user.playedGames.length) {
                const gameAlreadyPlayed = user.playedGames.find((g: PlayedGame) => g.boothId === data.body.boothId);
                if (null != gameAlreadyPlayed) {
                    throw new functions.https.HttpsError('already-exists', 'Game already played.');
                }
            }

            const boothRef = await admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).doc(data.body.boothId);
            const boothDoc = await t.get(boothRef);
            if (!boothDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Booth not found.');
            }

            playedGame = new PlayedGame();
            playedGame.boothId = data.body.boothId;
            playedGame.userId = userRef.id;
            playedGame.playedAt = (new Date()).toISOString();
            playedGame.score = Number(data.body.score);
            await t.update(userRef, { playedGames: firestore.FieldValue.arrayUnion(Object.assign({}, playedGame)) });
        });
        return playedGame;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Return user
*/
export const getUser = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    const userId = await checkAuth(data.auth);
    if (null == userId) {
        throw new functions.https.HttpsError('permission-denied', 'User authentication required');
    }

    try {
        // Get user snapshot
        const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found.');
        }
        const user = Object.assign(new User(), userDoc.data());
        delete user.hash;
        return user;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Return whole users list
*/
export const getUsers = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    const userId = await checkAuth(data.auth);
    if (null == userId) {
        throw new functions.https.HttpsError('permission-denied', 'User authentication required');
    }

    try {
        // Get users snapshot
        const usersRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).get();

        let users: User[] = [];
        if (!usersRef.empty) {
            users = usersRef.docs.map(user => {
                // create as User class instance and delete hash
                const userObj = Object.assign(new User(), user.data());
                delete userObj.hash;
                return userObj;
            });
        }

        return users;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/*
* Get played games
*/
export const getPlayedGames = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    const userId = await checkAuth(data.auth);
    if (userId !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin authentication required');
    }

    try {

        // Get booths
        let booths: Booth[] = [];
        const boothsSnapshot = await admin.firestore().collection(CONSTANTS.COLLECTION_BOOTHS).get();
        if (!boothsSnapshot.empty) {
            booths = boothsSnapshot.docs.map(doc => Object.assign(new Booth(), doc.data()));
        }

        const playedGames: any[] = [];
        const userSnapshot = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).get();
        userSnapshot.forEach(doc => {
            const user: User = doc.data() as User;
            const usePlayedGames = user.playedGames;
            delete user.playedGames;
            delete user.hash;
            if (usePlayedGames && 0 < usePlayedGames.length) {
                playedGames.push(...usePlayedGames.map(game => {
                    const booth = booths.find(p => p.id === game.boothId);
                    const boothName = booth ? booth.name : 'Unknown booth';
                    return Object.assign({ boothName: boothName }, game, user);
                }));
            }
        });
        return playedGames;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* UTILITY FUNCTIONS */

function isEmail(value: string): boolean {
    return null !== value.match(EMAIL_REG_EXP);
}

function getPasswordResetRequestEmailHtml(code: string, host: string) {
    return `<p>We have received a password reset request from your account. Click on the following link to generate a new password:</p>
            <p><a href="${host}/password-reset?code=${code}">${host}/password-reset?code=${code}</a></p>`;
}

function getPasswordResetEmailHtml(pass: string) {
    return `<p>The new password for your Treasure Hunt account is:</p>
            <h2>${pass}</h2>`;
}

async function uploadFile(path: string, filename: string, base64: string): Promise<string> {
    try {
        const bucket = admin.storage().bucket();
        const imageBuffer = Buffer.from(base64, 'base64');
        const file = bucket.file(`${path}/${filename}`);
        await file.save(imageBuffer);
        await file.makePublic();
        return file.publicUrl();
    } catch (error) {
        functions.logger.error(error, path, filename, base64);
        throw error;
    }
}

async function checkAuth(authToken: string) {
    if (!authToken) {
        throw new functions.https.HttpsError('permission-denied', 'Auth token not found');
    }
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.verify(authToken, CONSTANTS.SECRET) as any;
    return decoded.userId;
}