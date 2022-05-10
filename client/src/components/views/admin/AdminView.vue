<template>
    <div class="admin">
        <header>
            <nav>
                <ul class="admin__menu">
                    <li :class="{ selected: TABS.EVENT === tabIndex }" @click="tabIndex = TABS.EVENT">
                        Event
                    </li>
                    <li v-if="null != ihEvent" :class="{ selected: TABS.GAMES === tabIndex }" @click="tabIndex = TABS.GAMES">
                        Played games
                    </li>
                    <li v-if="null != ihEvent" :class="{ selected: TABS.BOOTHS === tabIndex }" @click="tabIndex = TABS.BOOTHS">
                        Booths
                    </li>
                    <li v-if="null != ihEvent" :class="{ selected: TABS.REGISTERED === tabIndex }" @click="tabIndex = TABS.REGISTERED">
                        Registered
                    </li>
                </ul>
            </nav>
            <inline-svg class="logo" :src="require('@/assets/ar-view-logo.svg')"></inline-svg>
            <button v-if="TABS.EVENT === tabIndex" @click="ihEventForm.show = true">{{null != ihEvent ? 'Edit event' : 'Create event'}}</button>
            <button v-if="null != ihEvent && (TABS.GAMES === tabIndex || TABS.REGISTERED === tabIndex)" @click="csvClickHandler">
                CSV
                <a ref="cvsAnchor" :href="playedGamesCsv" :download="csvName"></a>
            </button>
            <button v-if="null != ihEvent && TABS.BOOTHS === tabIndex" @click="openBoothFrom(null)">New booth</button>
        </header>
        <main>
            <IHEventView v-if="TABS.EVENT === tabIndex" :ihEvent="ihEvent"></IHEventView>
            <PlayedGamesView v-if="TABS.GAMES === tabIndex" @csv="playedGamesCsvHandler($event)"></PlayedGamesView>
            <BoothsView v-if="TABS.BOOTHS === tabIndex" :formHandler="openBoothFrom" :deleteHandler="deleteBoothHandler" :booths="ihEvent ? ihEvent.booths : []"></BoothsView>
            <RegisteredView v-if="TABS.REGISTERED === tabIndex" @csv="playedGamesCsvHandler($event)"></RegisteredView>
        </main>
        <BoothFormView :visible="boothForm.show" :booth="boothForm.selected" @close="boothFormCloseHandler"></BoothFormView>
        <IHEventFormView :visible="ihEventForm.show" :ihEvent=ihEvent @close="ihEventFormCloseHandler"></IHEventFormView>
        <ConfirmView :params="confirmParams" @close="closeConfirmHandler" ></ConfirmView>
    </div>
</template>

<script>
import firebaseService from "../../../services/firebase.service";

import PlayedGamesView from './PlayedGamesView.vue';
import BoothsView from './BoothsView.vue';
import BoothFormView from "./BoothFormView.vue";
import IHEventFormView from  "./IHEventFormView.vue";
import IHEventView from "./IHEventView.vue";
import ConfirmView from "../shared/ConfirmView.vue";
import RegisteredView from "./RegisteredView.vue";

export default {
    name: "AdminView",
    created() {
        this.TABS = {
            GAMES: 0,
            BOOTHS: 1,
            EVENT: 2,
            REGISTERED: 3
        };
        firebaseService.getEvent()
            .then( ihEvent => {
                this.ihEvent = ihEvent;
                this.tabIndex = this.TABS.GAMES;
            }).catch( error => {
                console.error(error);
                this.tabIndex = this.TABS.EVENT;
                this.ihEventForm.show = true;
            });
    },
    data() {
        return {
            tabIndex: null,
            ihEvent: null,
            boothForm: {
                show: false,
                selected: null
            },
            ihEventForm: {
                show: false
            },
            confirmParams: null,
            playedGamesCsv: null,
            csvName: 'playedGames.csv'
        }
    },
    components: {
        PlayedGamesView,
        RegisteredView,
        BoothsView,
        BoothFormView,
        IHEventFormView,
        IHEventView,
        ConfirmView
    },
    methods: {
        openBoothFrom(selectedBooth) {
            this.boothForm.selected = selectedBooth;
            this.boothForm.show = true;
        },
        deleteBoothHandler(selectedBooth) {
            this.confirmParams = {
                visible: true,
                title: 'Delete booth?',
                description: `Are you sure you want to delete "${selectedBooth.name}"?                
                You can’t undo this action.`,
                confirmHandler: () => this.deleteBooth(selectedBooth)
            }
        },
        async deleteBooth(booth) {
            await firebaseService.deleteBooth(booth.id);
            const booths = this.ihEvent.booths.filter(p => p.id !== booth.id);
            this.ihEvent.booths = booths;
            this.closeConfirmHandler();
        },
        boothFormCloseHandler(data) {
            if (data) {
                const booth = this.ihEvent.booths.find(p => p.id === data.id);
                if (booth) {
                    if (data.logoUrl) {
                        data.logoUrl += `?${(new Date()).getTime()}`;
                    }
                    Object.assign(booth, data);
                    const temp = [... this.ihEvent.booths];
                    temp.sort( (a, b) => a.name.trim().toLocaleUpperCase().localeCompare(b.name.trim(), undefined, {numeric: true, sensitivity: 'base'}));
                    this.ihEvent.booths = temp;
                } else {
                    const temp = [data, ...this.ihEvent.booths];
                    temp.sort( (a, b) => a.name.trim().toLocaleUpperCase().localeCompare(b.name.trim(), undefined, {numeric: true, sensitivity: 'base'}));
                    this.ihEvent.booths = temp;
                }
            }
            this.boothForm.show = false;
        },
        ihEventFormCloseHandler(data) {
            if (null == this.ihEvent) {
                this.ihEvent = {};
            }
            Object.assign(this.ihEvent, data);
            if (null == this.ihEvent.booths) {
                this.ihEvent.booths = [];
            }
            this.ihEventForm.show = false;
        },
        closeConfirmHandler() {
            this.confirmParams = {};
        },
        playedGamesCsvHandler(eventData) {
            this.playedGamesCsv = eventData.csv;
            this.csvName = eventData.name; 
        },
        csvClickHandler() {
            if (this.playedGamesCsv) {
                this.$refs.cvsAnchor.click();
            }
        }
    }
}
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
</style>