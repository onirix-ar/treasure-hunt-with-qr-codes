<template>
    <div v-if="params && params.visible">
        <div class="backdrop"></div>
        <div class="dialog">
            <div class="dialog__header">
                <h1>{{params.title}}</h1>
                <button class="close" @click="closeDialog">
                    <inline-svg class="logo" :src="require('@/assets/x-close.svg')" ></inline-svg>
                </button>
            </div>
            <div class="dialog__body" :innerText="params.description"></div>
            <div class="dialog__footer">
                <button @click="closeDialog">
                    Cancel
                </button>
                <button class="delete" @click="params.confirmHandler">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>
<script>

export default {
    name: "ConfirmView",
    props: {
        params: {
            visible: null,
            title: null,
            description: null,
            confirmHandler: null
        }
    },
    methods: {
        closeDialog() {
            this.$emit('close', null);
        }
    }
}
</script>
<style scoped lang="scss">

.dialog__header .close {
    width: fit-content;
}

</style>