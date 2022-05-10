<template>
    <div class="layout--users">
        <div>
            <inline-svg class="logo" :src="require('@/assets/ar-view-logo-purple.svg')"></inline-svg>
            
            <div class="step">
                <h1>Request a new password</h1>
                <p v-if="!sent">Enter your email address to receive an email with a link to create a new password.</p>
                <p v-if="sent">A password generation link was sent to <b>{{ email }}</b>. Please, check your inbox.</p>
            </div>
            
            <div v-if="!sent" class="form">
                <div class="form__item" :class="{'form__item--error': 0 < v$.email.$errors?.length}">
                    <input type="email" placeholder="Email" v-model="email" @blur="this.v$.email.$touch" />
                    <ErrorFormItemView :errors="v$.email.$errors"></ErrorFormItemView>
                </div>
            </div>
        </div>
        <div class="footer">
            <div v-if="error" class="main-error">{{error}}</div>
            <button v-if="!sent" :disabled="v$.$invalid" @click="submitHandler" :class="{'loading': sending}">
                <span class="icon"></span>
                <span>Send me instructions</span>
            </button>
            <p>
                <router-link to="/login" v-if="!sent">Cancel</router-link>
                <router-link to="/login" v-if="sent" >Return to login page</router-link>
            </p>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import ErrorFormItemView from './shared/ErrorFormItemView.vue';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'ForgotPasswordView',
    components: {
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    data() {
        return {
            email: null,
            sent: false,
            error: null,
            sending: false
        }
    },
    validations() {
        return {
            email: { required, email }
        }
    },
    methods: {
        async submitHandler() {
            try {
                this.sending = true;
                const isFormCorrent = await this.v$.$validate();
                if (!isFormCorrent) {
                    return;
                }
                this.error = null;
                await firebaseService.requestPasswordReset(this.email);
                this.sent = true;
                analyticsService.sendEvent('request_password_view', {email: this.email});
                this.sending = false;
            } catch (error) {
                this.error = error.message;
                console.error(error);
                analyticsService.sendEvent('request_password_view_error', {email: this.email, error: this.error});
                this.sending = false;
            }
        }
    }
}
</script>
