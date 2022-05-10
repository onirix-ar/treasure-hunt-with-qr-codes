<template>
    <div class="layout--game">
        <div class="header">
            <div class="header__logo">
                <inline-svg :src="require('@/assets/ar-view-logo-purple.svg')"></inline-svg>
                <span @click="toggleFullScreen" v-if="fullScreenSupported">
                    <inline-svg :src="require('@/assets/maximize.svg')"></inline-svg>
                </span>
            </div>
            <div class="header__help" @click="howToPlayOpen = true">
                <inline-svg :src="require('@/assets/question.svg')"></inline-svg>
            </div>
        </div>
        <div class="footer">
            <BoothsView></BoothsView>
        </div>
        <div class="content">
            <div v-if="TABS.PLAYED === tabIndex">
                <inline-svg :src="require('@/assets/booth-played.svg')"></inline-svg>
                <h1>Been there, done that!</h1>
                <p>You have already played this location</p>
                <div class="score" v-if="null != totalScore">
                    <span>Current score:</span>
                    <span class="score__points"><span>{{totalScore}}</span>pts</span>
                </div>
                <p class="note">Earn even more points by scanning QR codes at other available booths.</p>
            </div>
            <div v-if="TABS.END === tabIndex">
                <inline-svg :src="require('@/assets/keep-it-up.svg')"></inline-svg>
                <h1>Nice work!</h1>
                <p>You've extended your score by <span>{{points}} pts.</span></p>
                <div class="score" v-if="null != totalScore">
                    <span>Total score:</span>
                    <span class="score__points"><span>{{totalScore}}</span>pts</span>
                </div>
            </div>
            <div v-if="TABS.HOME === tabIndex">
                <img src="../../assets/welcome.webp" alt="Welcome" />
                <h1>Welcome!</h1>
                <p>Look for the hidden QR codes in the different locations, scan the QR and hunt for the hidden content floating around you.</p>
                <div class="score" v-if="null != totalScore">
                    <span>Current score:</span>
                    <span class="score__points"><span>{{totalScore}}</span>pts</span>
                </div>
            </div>
        </div>
    </div>
    <HowToPlayView :open="howToPlayOpen" @close="howToPlayOpen = false" ></HowToPlayView>
</template>
<script>
import HowToPlayView from "./HowToPlayView.vue";
import BoothsView from './BoothsView.vue';
import firebaseService from "../../services/firebase.service";
import { useRoute } from 'vue-router';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'ExperienceEndView',
    components: {
        BoothsView,
        HowToPlayView
    },
    props: ['points'],
    data() {
        return {
            tabIndex: null,
            fullScreenSupported: document.exitFullscreen !== undefined,
            totalScore: null,
            howToPlayOpen: false
        }
    },
    created() {
        this.TABS = {
            PLAYED: 0,
            END: 1,
            HOME: 2
        };
        const route = useRoute();
        this.getTotalScore().finally( () => {    
            if ('home' === route.name) {
                this.tabIndex = this.TABS.HOME;
                analyticsService.sendEvent('home_view', {});
            } else if (null != this.points) {
                this.tabIndex = this.TABS.END;
                analyticsService.sendEvent('game_end_view', {});
            } else {
                this.tabIndex = this.TABS.PLAYED;
                analyticsService.sendEvent('alredy_played_view', {});
            }
        });
    },
    methods: {
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        async getTotalScore() {
            const user = await firebaseService.getUser();
            let total = 0;
            if (user && user.playedGames) {
                user.playedGames.forEach( g => total += +g.score);
            }
            this.totalScore = total;
        }
    }
}
</script>
<style scoped lang="scss">
@import '../../../public/css/game.scss'; 
h1 {
    font-family: var(--font-title);
    color: var(--color-font-dark);
    font-size: 27px;
    font-weight: 800;
    margin-top: 24px;
    margin-bottom: 0px;
}

.content {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 30px 30px 0px 30px;
    text-align: center;
    width: 100%;

    color: var(--color-font-dark);

    img, svg {
        width: 170px;
    }
    & > * {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    p {
        margin-top: 10px;
        margin-bottom: 24px;
        font-size: 18px;
    }
    .score {
        position: unset;
        transform: unset;
        bottom: unset;
        left: unset;
        width: 100%;
        max-width: 400px;
    }
}

p.note {
    color: var(--background-dark);
    margin-top: 24px;
    margin-bottom: 24px;
    font-size: 15px;
}

</style>
