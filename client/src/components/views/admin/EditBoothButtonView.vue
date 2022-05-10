<template>
    <button class="small" @click="buttonClickHandler">Edit</button>
</template>
<script>
    export default {
        name: 'EditBoothButtonView',
        data: function() {
            return {
                callback: null
            }
        },
        beforeMount() {
            this.callback = this.params.value;
        },
        methods: {
            buttonClickHandler() {
                this.callback();
            }
        }
    }
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
</style>