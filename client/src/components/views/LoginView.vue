<template>
    <div class="layout--users">
        <div>
            <inline-svg class="logo" :src="require('@/assets/ar-view-logo-purple.svg')"></inline-svg>
            
            <div class="step">
                <h1>Welcome back!</h1>
                <p>Enter your email and password</p>
            </div>
            
            <div class="form" :class="{'loading': loading}">
                <div class="form__item" :class="{'form__item--error': 0 < v$.email.$errors?.length}">
                    <input type="email" placeholder="Email" v-model="email" @blur="this.v$.email.$touch" />
                    <ErrorFormItemView :errors="v$.email.$errors"></ErrorFormItemView>
                </div>
                <div class="form__item form__item--password" :class="{'form__item--error': 0 < v$.email.$password?.length}">
                    <input :type="showPassword ? 'text' : 'password'" placeholder="Password" v-model="password" @blur="this.v$.password.$touch" />
                    <span class="eye" :class="{'eye--show' : showPassword}" @click="showPasswordHandler"></span>
                    <ErrorFormItemView :errors="v$.password.$errors"></ErrorFormItemView>
                </div>
            </div>
            

        </div>
        <div class="footer">
            <div v-if="error" class="main-error">{{error}}</div>
            <button :disabled="v$.$invalid" @click="submitLogin" :class="{'loading': loading}">
                <span class="icon"></span>
                <span>Let's go!</span>
            </button>
            <p class=""><router-link to="/recover">I forgot my password</router-link> - <router-link to="/register">Sign up</router-link></p>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import authService from "../../services/auth.service";
import useVuelidate from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import ErrorFormItemView from './shared/ErrorFormItemView.vue';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'LoginView',
    components: {
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    data() {
        return {
            showPassword: false,
            email: null,
            password: null,
            error: null,
            loading: false
        }
    },
    validations() {
        return {
            email: { required, email },
            password: { required, minLength: minLength(6) },
        }
    },
    methods: {
        showPasswordHandler() {
            this.showPassword = !this.showPassword;
        },
        async submitLogin() {
            try {
                const isFormCorrent = await this.v$.$validate();
                if (!isFormCorrent) {
                    analyticsService.sendEvent('login_view_invalid_form', {email: this.email, password: this.password});
                    return;
                }
                this.error = null;
                this.loading = true;
                const loginResponse = await firebaseService.login(this.email, this.password);
                if (loginResponse.authToken) {
                    authService.setAuth(loginResponse.authToken);
                    await firebaseService.getUser();
                    analyticsService.sendEvent('login_view_success', {email: this.email});
                    if (authService.getPlayURL()) {
                        this.$router.push({ path: authService.getPlayURL() });
                    } else {
                        this.$router.push({ name: 'home' });
                    }
                }
                this.loading = false;
            } catch (error) {
                this.error = error.message;
                this.loading = false;
                console.error(error);
                analyticsService.sendEvent('login_view_error', {email: this.email, error: this.error });
            }
        }
    }
}
</script>
