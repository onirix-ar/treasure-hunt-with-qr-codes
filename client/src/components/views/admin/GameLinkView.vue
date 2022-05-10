<template>
    <a :href="href" target="_blank">{{this.href}}</a>
</template>
<script>
    export default {
        name: 'QrCodeGoogleLinkView',
        data: function() {
            return {
                href: null
            }
        },
        beforeMount() {
            this.href = this.params.value;
        }
    }
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
</style>