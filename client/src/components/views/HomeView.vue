<template>
    <div class="layout">
        <div v-if="ihEvent">
            <inline-svg class="logo" :src="require('@/assets/ar-view-logo.svg')"></inline-svg>
            <div class="event">
                <p>Welcome to</p>
                <h1>{{ihEvent.name}}</h1>
                <p class="event__subtitle">Find the hidden QR codes, unlock and collect all the items</p>
            </div>
            <img class="event__logo" alt="Event logo" :src="ihEvent.logoUrl" />
            <button class="noBg">
                <inline-svg :src="require('@/assets/question.svg')"></inline-svg>
                <span @click="howToPlayOpen = true">How to play</span>
            </button>
        </div>
        <div v-if="ihEvent" class="footer">
            <button @click="$router.push({name: 'register'})">
                Create account to play
            </button>
            <p class="">Already have an account? <router-link to="/login">Login here</router-link></p>
        </div>
    </div>
    <HowToPlayView :open="howToPlayOpen" :showFoot="false" @close="howToPlayOpen = false" ></HowToPlayView>
</template>
<script>
import HowToPlayView from "./HowToPlayView.vue";
import firebaseService from "../../services/firebase.service";
import analyticsService from '../../services/analytics.service';

export default {
    name: 'HomeView',
    components: {
        HowToPlayView
    },
    data() {
        return {
            ihEvent: null,
            howToPlayOpen: false
        }
    },
    created() {
        analyticsService.sendEvent('no_auth_view', {});
        firebaseService.getEvent()
            .then( ihEvent => {
                this.ihEvent = ihEvent;
            }).catch( error => {
                console.error(error);
            });
    }
}

</script>
<style scoped lang="scss">

.layout--game.open {
    top: 0vh !important;
}

.layout {
    color: var(--color-font-light);
    background-image: url(../../assets/welcome-bg.webp);
    background-position: center;
    background-size: cover;
    & > div {
        text-align: center;
        align-items: center;
    }
}

.logo {
    width: 161.3px;
    height: 44px;
    margin-top: 51px;
    margin-bottom: 53px;
}

.event {
    & > * {
        margin: 0px 0px 20px 0px;
    }
    & > *:last-child {
        margin-bottom: 0px;
    }
    .event__subtitle {
        font-family: Lato;
        font-size: 15px;
    }
}
.event__logo {
    height: 120px;
    background-color: rgba(255, 255, 255, 0.87);
    margin-bottom: 27px;
}

.footer {
    margin: 36px 0 38px 0;
    a {
        color: var(--color-font-light);
    }
}

</style>