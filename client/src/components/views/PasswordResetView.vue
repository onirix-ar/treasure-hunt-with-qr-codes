<template>
    <div class="layout--users">
        <div>
            <inline-svg class="logo" :src="require('@/assets/ar-view-logo-purple.svg')"></inline-svg>
            
            <div class="step">
                <h1>Password reset</h1>
                <p v-if="sent">A new password has been generated. You'll receive an email with its details.</p>
            </div>
        </div>
        <div class="footer">
            <div v-if="error" class="main-error">{{error}}</div>
            <p>
                <router-link to="/login">Return to login page</router-link>
            </p>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import { useRoute } from 'vue-router';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'PasswordResetView',
    data() {
        return {
            sent: false,
            error: null
        }
    },
    async created() {
        const route = useRoute();
        const code = route.query.code;
        if (code) {
            try {
                await firebaseService.resetPassword(code);
                this.sent = true;
                 analyticsService.sendEvent('password_reset_view_success', { code: code});
            } catch(error) {
                this.error = error.message;
                analyticsService.sendEvent('password_reset_view_error', { code: code, error: error });
            }
            
        } else {
            this.error = 'Code parameter is required';
            analyticsService.sendEvent('password_reset_view_error', { error: this.error });
        }
    }
}
</script>
