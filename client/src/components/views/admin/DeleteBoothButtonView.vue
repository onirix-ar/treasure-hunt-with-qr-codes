<template>
    <button class="small delete" @click="buttonClickHandler">Delete</button>
</template>
<script>
    export default {
        name: 'DeleteBoothButtonView',
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