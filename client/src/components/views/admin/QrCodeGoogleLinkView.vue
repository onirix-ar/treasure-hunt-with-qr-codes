<template>
    <a :href="googleLink" target="_blank">Get QR</a>
</template>
<script>
    export default {
        name: 'QrCodeGoogleLinkView',
        data: function() {
            return {
                googleLink: null
            }
        },
        beforeMount() {
            this.googleLink = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(this.params.value)}`;
            //this.googleLink = this.params.value;
        }
    }
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
</style>