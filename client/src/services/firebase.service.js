import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import Constants from '../constants';
import authService from "./auth.service";

class FirebaseService {

    constructor() {
        this._ADMIN_TOKEN = 'FIREBASE ADMIN TOKEN';

        const firebaseConfig = {
            apiKey: "FIREBASE API KEY",
            authDomain: "FIREBASE DOMAIN",
            projectId: "treasure-hunt",
            storageBucket: "GOOGLE STORAGE BUCKET",
            messagingSenderId: "MESSAGING SENDER ID",
            appId: "APP ID",
            measurementId: "GOOGLE ANALYTICS ID"
        }

        const fireApp = initializeApp(firebaseConfig);
        this.fireFunctions = getFunctions(fireApp, 'europe-west1');

        if ('development' === Constants.ENV) {
            console.log("connected to emulator");
            connectFunctionsEmulator(this.fireFunctions, "localhost", 5001);
        }

        this._mailAvailable = httpsCallable(this.fireFunctions, 'mailAvailable');
        this._register = httpsCallable(this.fireFunctions, 'register');
        this._login = httpsCallable(this.fireFunctions, 'login');
        this._requestPasswordReset = httpsCallable(this.fireFunctions, 'requestPasswordReset');
        this._resetPassword = httpsCallable(this.fireFunctions, 'resetPassword');

        this._user = null;
        this._getUser = httpsCallable(this.fireFunctions, 'getUser');
        this._getUsers = httpsCallable(this.fireFunctions, 'getUsers');
        this._saveGame = httpsCallable(this.fireFunctions, 'saveGame');

        this._ihEvent = null;
        this._getEvent = httpsCallable(this.fireFunctions, 'getEvent');
        this._saveEvent = httpsCallable(this.fireFunctions, 'saveEvent');
        this._getGames = httpsCallable(this.fireFunctions, 'getPlayedGames');
        this._deleteGame = httpsCallable(this.fireFunctions, 'deleteGame');

        this._saveBooth = httpsCallable(this.fireFunctions, 'saveBooth');
        this._deleteBooth = httpsCallable(this.fireFunctions, 'deleteBooth');
    }

    async deleteGame(userId, boothId) {
        try {
            await this._deleteGame(
                new RequestWrapper({ userId: userId, boothId: boothId }, this._ADMIN_TOKEN)
            );
            return;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async saveGame(boothId, score) {
        try {
            const response = await this._saveGame(
                new RequestWrapper({ boothId: boothId, score: score }, authService.getAuthToken())
            );
            const user = await this.getUser(authService.getAuthToken());
            user.playedGames.push(response.data);
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }


    async getUser() {
        try {
            if (null == this._user) {
                const response = await this._getUser(
                    new RequestWrapper({}, authService.getAuthToken())
                );
                this._user = response.data;
            }
            return this._user;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async getUsers() {
        try {
            const response = await this._getUsers(
                new RequestWrapper({}, this._ADMIN_TOKEN)
            );
            this._users = response.data;
            return this._users;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async deleteBooth(id) {
        try {
            const response = await this._deleteBooth(
                new RequestWrapper({
                    id: id,
                }
                    , this._ADMIN_TOKEN)
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async saveBooth(id, name, description, location, onirixProjectOid, onirixSceneOid, logoImage) {
        try {
            const response = await this._saveBooth(
                new RequestWrapper({
                    id: id,
                    name: name,
                    description: description,
                    location: location,
                    onirixProjectOid: onirixProjectOid,
                    onirixSceneOid: onirixSceneOid,
                    logoImage: logoImage
                }
                    , this._ADMIN_TOKEN)
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async getEvent() {
        try {
            if (null == this._ihEvent) {
                const response = await this._getEvent(
                    new RequestWrapper({}, this._ADMIN_TOKEN)
                );
                this._ihEvent = response.data;

                const time = (new Date()).getTime();
                this._ihEvent.logoUrl = this._ihEvent.logoUrl += `?${time}`;
                if (this._ihEvent.booths && 0 < this._ihEvent.booths.length) {
                    this._ihEvent.booths.forEach(p => p.logoUrl += `?${time}`);
                }
            }
            return this._ihEvent;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async saveEvent(name, logoImage) {
        try {
            const response = await this._saveEvent(
                new RequestWrapper({
                    name: name,
                    logoImage: logoImage
                }
                    , this._ADMIN_TOKEN)
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async mailAvailable(email) {
        try {
            const response = await this._mailAvailable(
                new RequestWrapper({ email: email })
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async register(email, password, firstName, lastName, company, jobTitle) {
        try {
            const response = await this._register(
                new RequestWrapper({
                    firstName: firstName,
                    lastName: lastName,
                    company: company,
                    jobTitle: jobTitle,
                    email: email,
                    password: password
                })
            );
            authService.clearHowToPlaySeen();
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await this._login(
                new RequestWrapper({
                    email: email,
                    password: password
                })
            );
            authService.clearHowToPlaySeen();
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async requestPasswordReset(email) {
        try {
            await this._requestPasswordReset(
                new RequestWrapper({ email: email })
            );
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async resetPassword(code) {
        try {
            await this._resetPassword(
                new RequestWrapper({ code: code })
            );
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async getGames() {
        try {
            const response = await this._getGames(
                new RequestWrapper({}, this._ADMIN_TOKEN)
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
}

class RequestWrapper {

    constructor(body, auth) {
        this.body = body;
        this.auth = auth;
    }

}

const firebaseService = new FirebaseService();

export default firebaseService;