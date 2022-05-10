<template>
    <div class="layout--users">
        <div>
            <inline-svg class="logo" :src="require('@/assets/ar-view-logo-purple.svg')"></inline-svg>
            
            <div class="step" v-if="stepIndex === STEPS.LOGIN">
                <p>STEP 1 of 2</p>
                <h1>Create an account</h1>
                <p>Please provide an email and password</p>
            </div>
            
            <div class="step" v-if="stepIndex === STEPS.DETAILS">
                <p class="step__nav">
                    <span @click="stepIndex = this.STEPS.LOGIN">
                        <inline-svg :src="require('@/assets/arrow-left.svg')"></inline-svg>
                    </span>
                    <span>STEP 2 of 2</span>
                </p>
                <h1>Personal info</h1>
                <p>Please complete the following fields</p>
            </div>

            <div class="form" v-if="stepIndex === STEPS.LOGIN" :class="{'loading': loading}">
                <div class="form__item" :class="{'form__item--error': 0 < v$.email.$errors?.length}">
                    <input type="email" placeholder="Email" v-model="v$.email.$model" @focus="resetError"/>
                    <ErrorFormItemView :errors="v$.email.$errors"></ErrorFormItemView>
                </div>
                <div class="form__item form__item--password" :class="{'form__item--error': 0 < v$.password.$errors?.length}">
                    <input :type="showPassword ? 'text' : 'password'" placeholder="Password"  v-model="v$.password.$model" />
                    <span class="eye" :class="{'eye--show' : showPassword}" @click="showPasswordHandler"></span>
                    <ErrorFormItemView :errors="v$.password.$errors"></ErrorFormItemView>
                </div>
                <div class="form-item">
                    <div class="check" :class="{'selected' : v$.privacyPolicy.$model}">
                        <span class="box" @click="v$.privacyPolicy.$model = !v$.privacyPolicy.$model">
                            <input type="checkbox" v-model="v$.privacyPolicy.$model"/>
                        </span>
                        <span class="label">I accept the <a href="" target="_blank">Privacy Policy</a>.</span>
                    </div>
                </div>
            </div>

            <div class="form" v-if="stepIndex === STEPS.DETAILS" :class="{'loading': loading}">
                <div class="form__item" :class="{'form__item--error': 0 < v$.firstName.$errors?.length}">
                    <input placeholder="First name" v-model="firstName" @blur="this.v$.firstName.$touch" />
                    <ErrorFormItemView :errors="v$.firstName.$errors"></ErrorFormItemView>
                </div>
                <div class="form__item" :class="{'form__item--error': 0 < v$.lastName.$errors?.length}">
                    <input placeholder="Last name" v-model="lastName" @blur="this.v$.lastName.$touch"/>
                    <ErrorFormItemView :errors="v$.lastName.$errors"></ErrorFormItemView>
                </div>
                <div class="form__item" :class="{'form__item--error': 0 < v$.company.$errors?.length}">
                    <input placeholder="Company" v-model="company" @blur="this.v$.company.$touch"/>
                    <ErrorFormItemView :errors="v$.company.$errors"></ErrorFormItemView>
                </div>
                <div class="form__item" :class="{'form__item--error': 0 < v$.jobTitle.$errors?.length}">
                    <input placeholder="Job title" v-model="this.v$.jobTitle.$model"/>
                    <ErrorFormItemView :errors="v$.jobTitle.$errors"></ErrorFormItemView>
                </div>
            </div>
        </div>
        <div class="footer">
            <div v-if="error" class="main-error">{{error}}</div>
            <button v-if="stepIndex === STEPS.LOGIN" @click="goToDetails" :disabled="!privacyPolicy" :class="{'loading': loading}">
                <span class="icon"></span>
                <span>Continue</span>
            </button>
            <button v-if="stepIndex === STEPS.DETAILS" @click="submitUser" :class="{'loading': loading}">
                <span class="icon"></span>
                <span>Create account</span>
            </button>
            <p class="">Already have an account? <router-link to="/login">Log in here</router-link></p>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import useVuelidate from '@vuelidate/core';
import { required, email, minLength} from '@vuelidate/validators';
import ErrorFormItemView from './shared/ErrorFormItemView.vue';
import authService from '../../services/auth.service';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'RegisterView',
    components: {
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    created() {
        this.STEPS = {
            LOGIN: 0,
            DETAILS: 1
        };
        this.stepIndex = this.STEPS.LOGIN;
    },
    data() {
        return {
            showPassword: false,
            stepIndex: null,
            email: null,
            password: null,
            firstName: null,
            lastName: null,
            company: null,
            jobTitle: null,
            privacyPolicy: false,
            error: null,
            loading: false
        }
    },
    validations() {
        return {
            email: {required, email, $autoDirty: true },
            password: { required, minLength: minLength(6), $autoDirty: true },
            firstName: { required, minLength: minLength(1), $autoDirty: true },
            lastName: { required, $autoDirty: true },
            company: { required, $autoDirty: true },
            jobTitle: { required, $autoDirty: true },
            privacyPolicy: { required, minLength: minLength(1), $autoDirty: true }
        }
    },
    methods: {
        resetError() {
            this.error = null;
        },
        showPasswordHandler() {
            this.showPassword = !this.showPassword;
        },
        async goToDetails() {
            this.error = null;
            this.v$.email.$validate();
            this.v$.password.$validate();

            let isValid = this.privacyPolicy;
            isValid = isValid && !this.v$.email.$invalid;
            isValid = isValid && !this.v$.password.$invalid;
            if (isValid && this.email) {
                try {
                    this.loading = true;
                    await firebaseService.mailAvailable(this.email);
                } catch (error) {
                    console.error(error);
                    this.error = error.message;
                    analyticsService.sendEvent('register_error', {email: this.v$.email.$model, error: error});
                    isValid = false;
                } finally {
                    this.loading = false;
                }
            }
            if (isValid) {
                this.stepIndex = this.STEPS.DETAILS;
            }
        },
        async submitUser() {
            try {
                const isFormCorrent = await this.v$.$validate();
                if (!isFormCorrent) {
                    analyticsService.sendEvent('register_invalid_from', {
                        email: this.email, firstName: this.firstName, lastName: this.lastName,
                        company: this.company, jobTitle: this.jobTitle});
                    return;
                }
                this.error = null;
                this.loading = true;
                const registerResponse = await firebaseService.register(
                    this.email,
                    this.password,
                    this.firstName,
                    this.lastName,
                    this.company,
                    this.jobTitle
                );
                if (registerResponse.authToken) {
                    authService.setAuth(registerResponse.authToken);
                    await firebaseService.getUser();
                    analyticsService.sendEvent('register_succeess', {
                        email: this.email, firstName: this.firstName, lastName: this.lastName,
                        company: this.company, jobTitle: this.jobTitle});
                    if (authService.getPlayURL()) {
                        this.$router.push({ path: authService.getPlayURL() });
                    } else {
                        this.$router.push({ name: 'home' });
                    }
                }
            } catch (error) {
                this.error = error.message;
                console.error(error);
                analyticsService.sendEvent('register_error', {
                        error: this.error,
                        email: this.email, firstName: this.firstName, lastName: this.lastName,
                        company: this.company, jobTitle: this.jobTitle});
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.step__nav {
    display: inline-flex;
    align-items: center;
    line-height: 0px;
    svg {
        margin-right: 15px;
    }
}
</style>
