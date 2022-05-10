import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import InlineSvg from 'vue-inline-svg';
import App from './App.vue'
import AdminView from './components/views/admin/AdminView.vue'
import RegisterView from './components/views/RegisterView.vue'
import LoginView from './components/views/LoginView.vue'
import ForgotPasswordView from './components/views/ForgotPasswordView.vue'
import ExperienceView from './components/views/ExperienceView.vue'
import HowToPlayView from './components/views/HowToPlayView.vue'
import ExperienceEndView from './components/views/ExperienceEndView.vue'
import PasswordResetView from './components/views/PasswordResetView.vue';
import ErrorView from './components/views/shared/ErrorView.vue';
import HomeView from './components/views/HomeView.vue'
import authService from './services/auth.service';
import firebaseService from './services/firebase.service';

const routes = [
    { path: '/', name: 'home', component: ExperienceEndView },
    { path: '/unregister', name: 'unregister', component: HomeView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/recover', name: 'recover', component: ForgotPasswordView },
    { path: '/password-reset', name: 'reset', component: PasswordResetView },
    { path: '/play/:code', name: 'experience', component: ExperienceView, props: true },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/how-to-play', name: 'howToPlay', component: HowToPlayView },
    { path: '/experience-end', name: 'experienceEnd', component: ExperienceEndView, props: true },
    { path: '/error', name: 'error', component: ErrorView, props: true },
    { path: '/:pathMatch(.*)*', name: 'notFound', component: ErrorView },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

const PUBLIC_ROUTES = ['login', 'register', 'recover', 'reset', 'admin', 'unregister', 'error'];

router.beforeEach(async (to, from, next) => {
    if ('experience' === to.name) {
        authService.setPlayURL(to.fullPath);
    }
    if (!authService.isLoggedIn() && !PUBLIC_ROUTES.includes(to.name) ) {
        authService.clearAuth();
        next({ name: 'unregister' });
    } else if ('experience' === to.name) {
        try {
            const code = to.params.code;
            const event = await firebaseService.getEvent();
            if (null == event) {
                throw new Error('Event not found.');
            }
            const booth = event.booths.find(p => p.id === code);
            if (null == booth) {
                throw new Error('Booth not found.');
            }
            try {
                const user = await firebaseService.getUser();
                if (null == user) {
                    authService.clearAuth();
                    next({ name: 'unregister' });
                    return;
                }
                const playedGame = user.playedGames.find(g => g.boothId === code);
                if (playedGame) {
                    next({ name: 'experienceEnd' });
                } else {
                    next();
                }
            } catch (error) {
                next({ name: 'unregister' });
            }
        } catch (error) {
            console.error(error);
            next({ name: 'error', params: { message: error.message } });
        }
    } else {
        next();
    }
});

createApp(App)
    .component('inline-svg', InlineSvg)
    .use(router)
    .mount('#app');
