
class AuthService {

    setAuth(authToken) {
        localStorage.setItem('authToken', authToken);
    }

    clearAuth() {
        localStorage.clear();
    }

    isLoggedIn() {
        return localStorage.getItem('authToken') != null;
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    setPlayURL(playUrl) {
        sessionStorage.setItem('playUrl', playUrl)
    }

    getPlayURL() {
        return sessionStorage.getItem('playUrl')
    }

    setHowToPlaySeen() {
        localStorage.setItem('HowToPlaySeen', new Date());
    }

    clearHowToPlaySeen() {
        localStorage.removeItem('HowToPlaySeen');
    }

    isHowToPlaySeen() {
        return localStorage.getItem('HowToPlaySeen') != null;
    }

    
}

const authService = new AuthService();

export default authService;