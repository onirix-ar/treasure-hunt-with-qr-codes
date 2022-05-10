<template>
    <div v-if="visible">
        <div class="backdrop"></div>
        <div class="dialog">
            <div class="dialog__header">
                <h1>Treasure Hunt event</h1>
                <button class="close" @click="closeDialog">
                    <inline-svg class="logo" :src="require('@/assets/x-close.svg')" ></inline-svg>
                </button>
            </div>
            <div class="dialog__body">
                <div class="form" :class="{'loading': saving}">
                    <div class="form__item">
                        <label>Event name</label>
                        <input type="text" placeholder="Event name" v-model="v$.name.$model" />
                        <ErrorFormItemView :errors="v$.name.$errors"></ErrorFormItemView>
                    </div>
                    <div class="form__row">
                        <div class="form__item">
                            <label>Event logo</label>
                            <ImageFormView :imageUrl="logoUrl" @change="imageFormChangeHandler(v$.logoBase64, v$.logoFilename, $event)"></ImageFormView>
                            <ErrorFormItemView :errors="v$.logoBase64.$errors"></ErrorFormItemView>
                        </div>
                    </div>
                </div>
            </div>  
            <div class="dialog__footer">
                <button @click="closeDialog(null)" class="cancel">
                    <span>Cancel</span>
                </button>
                <button @click="submitHandler" :class="{'loading': saving}">
                    <span class="icon"></span>
                    <span>Save event</span>
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import useVuelidate from '@vuelidate/core';
import firebaseService from "../../../services/firebase.service";
import { required } from '@vuelidate/validators';
import ImageFormView from '../shared/ImageFormView.vue';
import ErrorFormItemView from '../shared/ErrorFormItemView.vue';

export default {
    name: 'IHEventFormView',
    props: {
        visible: null,
        ihEvent: null
    },
    components: {
        ImageFormView,
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    data() {
        return {
            name: '',
            logoFilename: '',
            logoBase64: '',
            logoUrl: '',
            saving: false
        }
    },
    validations() {
        const localRules = {
            name: { required },
            logoFilename: {},
            logoBase64: {}
        }

        if (null == this.logoUrl) {
            localRules.logoBase64 = { required };
        }
        return localRules;
    },
    watch: {
        visible: function(value) {
            if (value && this.ihEvent) {
                this.name = this.ihEvent.name;
                this.logoUrl = this.ihEvent.logoUrl;
            } else {
                this.name = null;
                this.logoUrl = null;
            }
        },
        ihEvent: function (value) {
            if (value) {
                this.name = value.name;
                this.logoUrl = value.logoUrl;
            }
        }
    },
    methods: {
        closeDialog() {
            this.$emit('close', null);
            this.v$.$reset();
        },
        async submitHandler() {
            try {
                const isFormCorrent = await this.v$.$validate();
                if (!isFormCorrent) {
                    return;
                }
                this.saving = true;
                const response = await firebaseService.saveEvent(
                    this.name,
                    { fileName: this.logoFilename, base64: this.logoBase64},
                );
                if (response.logoUrl) {
                    response.logoUrl += `?${(new Date()).getTime()}`;
                }
                this.saving = false;
                this.$emit('close', response);
            } catch (error) {
                console.error(error);
                this.saving = false;
            }
        },
        imageFormChangeHandler(base64, fileName, eventObject) {
            if (null == eventObject) {
                fileName.$model = null;
                base64.$model = null;
            } else {
                fileName.$model = eventObject.fileName;
                base64.$model = eventObject.base64;
            }
        }
    }
}

</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
</style>