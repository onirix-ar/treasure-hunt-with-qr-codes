<template>
    <div class="container">
        <div class="menu">
            <div class="tab" @click="toggleBooths(true)">
                <inline-svg :src="require('@/assets/booths.svg')"></inline-svg>
                <span>Booths</span>
            </div>
        </div>
        <div id="booths-prices-container" :class="{ 'open' : open}">
            <div class="header">
                <div>
                    <span>Booths</span>
                </div>
                <inline-svg class="logo" :src="require('@/assets/x-close.svg')" @click="toggleBooths(false)" ></inline-svg>
            </div>
            <div class="content"> 
                <div>
                    <img src="../../assets/booths-directory.webp" alt="How to play image" ref="boothsTopElement"/>
                    <div class="instructions">
                        <h1>Playable booths</h1>
                        <p>The following is our complete list of booths participating in the Web AR Hunt adventure.</p>
                        
                        <div class="booth" v-for="booth of booths" :key="booth.id">
                            <div class="booth__image" :class="{'booth__image--played': booth.played}">
                                <span class="booth__badge" v-if="booth.played">Played</span>
                                <img :src="booth.logoUrl" alt="Booth logo" />
                            </div>
                            <div class="booth__name">{{booth.name}}</div>
                            <div class="booth__description">{{booth.description}}</div>
                            <div class="booth__location">
                                <span class="label">
                                    <inline-svg :src="require('@/assets/location.svg')"></inline-svg>
                                    <span>Location</span>
                                </span>
                                <span>- {{booth.location}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import analyticsService from '../../services/analytics.service';

export default {
    name: 'BoothsView',
    data() {
        return {
            open: false,
            booths: null,
            ihEvent: null
        }
    },
    created() {
        this.initBoothsList();
    },
    methods: {
        async initBoothsList() {
            this.ihEvent = await firebaseService.getEvent();
            const user = await firebaseService.getUser();
            if (this.ihEvent && this.ihEvent.booths) {
                this.booths = this.ihEvent.booths.map( booth => {
                    booth['played'] = user.playedGames.some(g => g.boothId === booth.id);
                    return booth;
                })
            }
        },
        toggleBooths(op) {
            if (op) {
                this.open = true;
                if (this.$refs['boothsTopElement']) {
                    this.$refs['boothsTopElement'].scrollIntoView({behavior: 'smooth', block: 'start'});
                }
                analyticsService.sendEvent('booths_view_close', 'booths');
            } else {
                this.open = false;
                analyticsService.sendEvent('booths_view_close', {});
            }
        }
    }
}
</script>
<style scoped lang="scss">

.container #booths-prices-container {
    position: fixed;
    z-index: 1;
    transition: top 0.2s;
    background: var(--color-background-light);
    top: 100%;
    width: 100vw;

    &.open {
       top: 0%; 
       height: 100%;
    }
    .content {
        height: 100%;
        overflow-y: auto;
        img {
            width: 100%;
            object-fit: cover;
        }
        p {
            font-size: 18px;
            margin: 0px;
            text-align: left;
        }
    }
    .header {
        background-color: var(--color-font-dark);
        font-family: var(--font-title);
        font-size: 20px;
        font-weight: bold;
        display:flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 25px 0px 20px;
        color: var(--color-font-light);
        height: 64px;
        width: 100vw;
        box-sizing: border-box;
    }
}

.instructions {
    padding: 24px 20px 48px 20px;
    color: var(--color-font-dark);
}

h1 {
    font-family: var(--font-title);
    font-size: 27px;
    font-weight: 800;
    margin: 0px 0px 10px 0px
}

.menu {
    display: flex;
    color: var(--color-font-light);
    background-color: var(--color-secondary);
    position: relative;
    z-index: 1;
    svg {
        margin-right: 6px;
    }
    & > div {
        width: 50%;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tab {
        width: 100%;
    }
}

.content .booth {
    margin-top: 24px;

    &:not(:last-child) {
        padding-bottom: 24px;
        border-bottom: 1px solid #a4a7ab;
    }

    &:last-child {
        margin-bottom: 24px;
    }

    .booth__image {
        height: 126px;
        border-radius: 2px;
        margin-bottom: 20px;

        background-color: white;

        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        
        > img {
            width: auto!important;
            max-height: 82px;
        }
    }
    .booth__image--played {
        border-top: 4px solid #f87a53;
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
    }
    .booth__badge {
        position: absolute;
        top: 0px;
        right: 0px;
        padding: 2px 8px;
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
        background-color: #f87a53;
        text-transform: uppercase;
        font-size: 13px;
        font-weight: bold;
        color: var(--color-font-light);
    }
    .booth__name {
        font-family: var(--font-title);
        font-size: 20px;
        font-weight: 800;
        margin-bottom: 10px;
    }
    .booth__description {
        font-size: 18px;
        margin-bottom: 20px;
    }
    .booth__location {
        display: flex;
        flex-direction: column;
        font-size: 18px;
        color: var(--color-secondary);
        .label {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            font-weight: bold;
            margin-bottom: 10px;
            svg {
                margin-right: 6px;
            }
        }
    }
}
</style>