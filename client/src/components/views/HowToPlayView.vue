<template>
    <div id="how-to-play-container" :class="{'open': open}">
        <div class="header">
            <div>How to play</div>
            <inline-svg class="logo" :src="require('@/assets/x-close.svg')" @click="$emit('close')"></inline-svg>
        </div>
        
        <div class="content" :class="{'content--footer': showFoot}">
            <img src="../../assets/join-hero.webp" alt="How to play image" />
            <div class="instructions">
                <h1>Tap Into the Action</h1>
                <p>This Web AR adventure is a virtual treasure hunt based augmented reality. To play, simply collect the 3D content hidden in the different locations.  The more you find, the more points you earn, and the more points you earn the better your chances of winning.  Good luck!</p>
                <h1 class="instructions__last-title">Instructions:</h1>
                <div class="rule">
                    <img src="../../assets/scan.jpg" alt="Scan to play" />
                    <h2>1. Play Nice With Everyone</h2>
                    <p>Once you arrive at an any location, simply scan the QR code on display using your phone’s camera to automatically activate the game.</p>
                    <p><span>Pro Tip:</span> How do you know which locations to visit and where to find them? Just tap on the Map button found at the bottom left corner of your screen for a complete list of all the locations.</p>
                </div>
                <div class="rule">
                    <img src="../../assets/capture.jpg" alt="Scan to play" />
                    <h2>2. Phone It In</h2>
                    <p>Once you’ve scanned the QR code, the 3D content will magically appear on your phone’s screen.  Look all around using your phone’s camera to spot each one, and then tap on it to add points to your total.</p>
                    <p><span>Pro Tip:</span> Pro Tip:  Power up your score by collecting the special content worth bonus points in select booths.  How can you find out where they’re hiding?  Just tap on the Booths button where we’ve left you some clues…</p>
                </div>
            </div>
        </div>

        <div class="footer" v-if="showFoot">
            <div @click="$emit('close')">
                Start the hunt!
            </div>
        </div>
    </div>
</template>
<script>
import authService from "../../services/auth.service";
import analyticsService from '../../services/analytics.service';

export default {
    name: 'HowToPlayView',
    props: {
        open: null,
        showFoot: null
    },
    watch: {
        open: function(value) {
            analyticsService.sendEvent('how_to_play_view', {action: true === value ? 'open' : 'close'});
            if (true == value) {
                authService.setHowToPlaySeen();
            }
        }
    }
}
</script>
<style scoped lang="scss">
@import '../../../public/css/game.scss'; 

#how-to-play-container {
    position: absolute;
    background: #fff;
    top: 100%;
    transition: top 0.2s;
    height: 100%;
}

#how-to-play-container.open {
    top: 0;
    z-index: 3;
}

#how-to-play-container .content {
    height: calc(100% - 64px);
    overflow-y: auto;
    &--footer {
        height: calc(100% - 128px);
    }
}

.footer, .header {
    background-color: var(--color-secondary);
    font-family: var(--font-title);
    font-size: 20px;
    font-weight: bold;
    display:flex;
    justify-content: center;
    align-items: center;
    height: 64px;
    color: var(--color-font-light);
}

.header {
    justify-content: space-between;
    padding: 0px 25px 0px 20px;
    background-color: var(--color-font-dark);
}

.content {
    & > img {
        height: 230px;
        width: 100%;
        object-fit: cover;
    }
}

.instructions {
    padding: 24px 20px 48px 20px;
}

.rule {
    img {
        height: 176px;
        width: 100%;
        object-fit: cover;
        margin-top: 24px;
        margin-bottom: 20px;
    }
    padding-bottom: 24px;
    border-bottom: solid 1px #a4a7ab;
    &:last-child {
        padding-bottom: 0px;
        border-bottom: unset;
    }
}

h1, h2 {
    font-family: var(--font-title);
    color: var(--color-font-dark);
    font-size: 27px;
    font-weight: 800;
    margin: 0px 0px 10px 0px
}

h2 {
    font-size: 20px;
}

.instructions__last-title {
    margin-top: 24px;
    margin-bottom: 0px;
}

p {
    color: var(--color-font-dark);
    font-size: 18px;
    margin: 0px;
    span {
        font-weight: bold;
    }
    a {
        font-weight: bold;
        color: var(--color-background-selected);
        text-decoration: none;
    }
    & + p {
        margin-top: 24px;
    }
}

</style>