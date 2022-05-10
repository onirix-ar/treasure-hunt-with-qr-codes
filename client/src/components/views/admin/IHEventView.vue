<template>
    <div class="hbdt-event">
        <div v-if="null == ihEvent" class="hbdt-event__empty">
            <h1>Event not found</h1>
        </div>
        <div v-if="null != ihEvent">
            <h1>{{ihEvent.name}}</h1>
            <h2>Event image</h2>
            <img :src="ihEvent.logoUrl" alt="Event logo"/>
        </div>
    </div>
</template>
<script>
export default {
    name: "IHEventView",
    props: {
        ihEvent: null
    }
}
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';

.hbdt-event {
    height: calc(100% - 40px);
    padding: 20px;
    overflow-y: auto;
    & > div {
        text-align: center;
    }
    h1, h2 {
        color: var(--color-background-dark)
    }
    h2 {
        font-size: 18px;
        margin-top: 18px;
    }
    img {
        width: 400px;
        border-radius: 5px;
    }
}
</style>