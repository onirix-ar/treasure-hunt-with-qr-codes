<template>
    <iframe v-if="project" ref="onirixFrame" id="onirix-frame" class="web_ar_iframe" :src="`${onirixHost}/projects/${project?.oid}/webar?token=${project?.publicToken}&scene=${booth.onirixSceneOid}`" allow="camera;gyroscope;accelerometer;geolocation"></iframe>
    
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
    <div class="score">
        <span>Collected {{score.catch}} of {{score.total}}</span>
        <span class="score__points"><span>{{score.points}}</span>pts</span>
    </div>
    <div class="footer">
        <BoothsView></BoothsView>
    </div>
    <HowToPlayView :open="howToPlayOpen" :showFoot="howToPlayFoot" @close="howToPlayCloseHandler" ></HowToPlayView>
</template>
<script>
import BoothsView from './BoothsView.vue';
import HowToPlayView from "./HowToPlayView.vue";
import firebaseService from "../../services/firebase.service";
import authService from "../../services/auth.service";
import OnirixAPI from '@onirix/api-client'
import OnirixEmbedSDK from "@onirix/embed-sdk";
import Constants from '../../constants'

const OnirixAPIClient = new OnirixAPI(Constants.API_TOKEN, `${Constants.ONIRIX_HOST}/api/`);
let embedSDK;

const logoNames = ["logo1", "logo2"];
const logoPoints = [10, 20];

export default {
    name: 'ExperienceView',
    components: {
        BoothsView,
        HowToPlayView
    }, 
    props: {
        code: {
            type: String
        }
    },
    data() {
        return {
            booth: null,
            onirixHost: Constants.ONIRIX_HOST,
            project: null,
            fullScreenSupported: document.exitFullscreen !== undefined,
            howToPlayOpen: false,
            howToPlayFoot: false,
            score: {
                total: 0,
                catch: 0,
                points: 0
            }
        }
    },
    async created() {
        if (!authService.isHowToPlaySeen()) {
            this.howToPlayFoot = true;
            this.howToPlayOpen = true;
            authService.setHowToPlaySeen();
        }
        const ihEvent = await firebaseService.getEvent();
        this.booth = ihEvent.booths.find( p => p.id === this.code);
        this.project = await OnirixAPIClient.getProject(this.booth.onirixProjectOid);

        this.$nextTick(() => {
            const iframe = document.querySelector("#onirix-frame");
            iframe.addEventListener('load', async () => {
                embedSDK = new OnirixEmbedSDK(iframe, this.onirixHost);
                await embedSDK.connect();
                embedSDK.subscribe(OnirixEmbedSDK.Events.SCENE_LOAD_START, (params) => {
                    this.onSceneLoad(params.oid);
                });
                embedSDK.subscribe(OnirixEmbedSDK.Events.ELEMENT_CLICK, (params) => {
                    this.onElementClick(params.name);
                });
            });
        })
    },
    methods: {
        async onSceneLoad(oid) {
            const scene = await OnirixAPIClient.getScene(oid);
            scene.elements.forEach(element => {
                if (logoNames.indexOf(element.name) !== -1) {
                    this.score.total++;
                }
            });
        },
        onElementClick(name) {
            const idx = logoNames.indexOf(name);
            if (idx !== -1) {
                this.score.catch++;
                this.score.points += logoPoints[idx];
            }
            if (this.score.catch === this.score.total) {
                this.endGame();
            }
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        howToPlayCloseHandler() {
            this.howToPlayOpen = false;
            this.howToPlayFoot = false;
        },
        endGame() {
            firebaseService.saveGame(this.booth.id, this.score.points).then(() => {
                this.$router.push({name: 'experienceEnd', params: { points: this.score.points }});
            }).catch((error) => {
                console.error(error);
                this.$router.push({name: 'error', params: { message: "An error ocurred while finishing the game" }});
            });
        }
    }
}
</script>
<style scoped lang="scss">
   
    iframe {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        border: none;
    }

    .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 64px;
        display: flex;
        background-color: var(--color-secondary);
        z-index: 2;
    }
    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 64px;
        z-index: 2;
    }

    .score {
        position: fixed;
        bottom: 88px;
        border-radius: 32px;
        background-color: var(--color-font-light);
        padding: 0px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        height: 49px;
        width: 300px;
        box-sizing: border-box;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
        color: var(--color-font-dark);

        .score__points {
            display: flex;
            align-items: center;
            span {
                margin-right: 6px;
                font-family: var(--font-title);
                font-size: 27px;
                font-weight: 800;
            }
        }
    }

    .header__logo {
        background-color: var(--color-font-light);
        flex-basis: calc(100vw - 75px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        padding: 0px 25px 0px 20px;
    }

    .header__help {
        flex-basis: 75px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-secondary);
    }
</style>