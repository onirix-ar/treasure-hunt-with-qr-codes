<template>
    <div v-if="visible">
        <div class="backdrop"></div>
        <div class="dialog">
            <div class="dialog__header">
                <h1>Booth</h1>
                <button class="close" @click="closeDialog(null)">
                    <inline-svg class="logo" :src="require('@/assets/x-close.svg')" ></inline-svg>
                </button>
            </div>
            <div class="dialog__body">
                <div class="form" :class="{'loading': saving}">
                    <div class="form__item">
                        <label>Booth name</label>
                        <input type="text" placeholder="Booth name" v-model="v$.name.$model" />
                        <ErrorFormItemView :errors="v$.name.$errors"></ErrorFormItemView>
                    </div>
                    <div class="form__item">
                        <label>Description</label>
                        <textarea placeholder="Booth description" v-model="v$.description.$model"></textarea>
                        <ErrorFormItemView :errors="v$.description.$errors"></ErrorFormItemView>
                    </div>
                    <div class="form__item">
                        <label>Location</label>
                        <input type="text" placeholder="Booth location" v-model="v$.location.$model" />
                        <ErrorFormItemView :errors="v$.location.$errors"></ErrorFormItemView>
                    </div>
                    <div class="form__row">
                        <div class="form__item">
                            <label>Booth logo</label>
                            <ImageFormView :imageUrl="logoUrl" @change="imageFormChangeHandler(v$.logoBase64, v$.logoFilename, $event)"></ImageFormView>
                            <ErrorFormItemView :errors="v$.logoBase64.$errors"></ErrorFormItemView>
                        </div>
                        <div class="form__column">
                            <div class="form__item">
                                <label>Onirix project</label>
                                <select v-model="onirixProjectOid" @change="onirixProjectChangeHandler($event)">
                                    <option value="" disabled selected>Select Onirix project</option>
                                    <option v-for="project in projectList" :value="project.oid" :key="project.oid">
                                        {{ project.name }}
                                    </option>
                                </select>
                                <ErrorFormItemView :errors="v$.onirixProjectOid.$errors"></ErrorFormItemView>
                            </div>
                            <div class="form__item">
                                <label>Onirix Scene</label>
                                <select v-model="onirixSceneOid">
                                    <option value="" disabled selected>Select Onirix scene</option>
                                    <option v-for="scene in scenesList" :value="scene.oid" :key="scene.oid">
                                        {{ scene.name }}
                                    </option>
                                </select>
                                <ErrorFormItemView :errors="v$.onirixSceneOid.$errors"></ErrorFormItemView>
                            </div>
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
                    <span>Save booth</span>
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
import Constants from "../../../constants";
import OnirixAPI from '@onirix/api-client';

const OnirixAPIClient = new OnirixAPI(Constants.API_TOKEN, `${Constants.ONIRIX_HOST}/api/`);

export default {
    name: 'BoothFormView',
    props: {
        visible: null,
        booth: null
    },
    components: {
        ImageFormView,
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    async created() {
        const allProjects = await OnirixAPIClient.getProjects();
        this.projectList = allProjects.filter(p => p.public);
    },
    data() {
        return {
            id: null,
            name: '',
            description: '',
            location: '',
            onirixProjectOid: '',
            onirixSceneOid: '',
            logoFilename: '',
            logoBase64: '',
            logoUrl: '',
            projectList: [],
            scenesList: [],
            saving: false
        }
    },
    validations() {
        const localRules = {
            name: { required },
            description: { required },
            location: {required},
            onirixProjectOid: { required },
            onirixSceneOid: { required },
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
            if (value && this.booth) {
                this.id = this.booth.id;
                this.name = this.booth.name;
                this.description = this.booth.description;
                this.location = this.booth.location;
                this.onirixProjectOid = this.booth.onirixProjectOid;
                this.loadProjectScenes(this.onirixProjectOid);
                this.onirixSceneOid = this.booth.onirixSceneOid;
                this.logoUrl = this.booth.logoUrl;
            } else {
                this.id = null,
                this.name = null;
                this.description = null;
                this.location = null;
                this.onirixProjectOid = null;
                this.onirixSceneOid = null;
                this.logoUrl = null;
            }
        },
        booth: function (value) {
            if (value) {
                this.id = value.id;
                this.name = value.name;
                this.description = value.description;
                this.logoUrl = value.logoUrl;
                this.location = value.location;
                this.onirixProjectOid = value.onirixProjectOid;
                this.onirixSceneOid = value.onirixSceneOid;
                this.logoUrl = value.logoUrl;
            }
        }
    },
    methods: {
        closeDialog(data) {
            this.$emit('close', data);
            this.v$.$reset();
        },
        async submitHandler() {
            try {
                const isFormCorrent = await this.v$.$validate();
                if (!isFormCorrent) {
                    return;
                }
                this.saving = true;
                const response = await firebaseService.saveBooth(
                    this.id,
                    this.name,
                    this.description,
                    this.location,
                    this.onirixProjectOid,
                    this.onirixSceneOid,
                    { fileName: this.logoFilename, base64: this.logoBase64}
                );
                this.saving = false;
                this.closeDialog(response);
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
        },
        onirixProjectChangeHandler(eventData) {
            this.v$.onirixSceneOid.$model = null;
            this.loadProjectScenes(eventData.target.value);
        },
        async loadProjectScenes(projectOid) {
            const selectedProject = this.projectList.find(p => p.oid === projectOid );
            if (selectedProject && null == selectedProject.scenes) {
                selectedProject.scenes = await OnirixAPIClient.getScenes(projectOid);
            }
            this.scenesList = selectedProject.scenes;
        }
    }
}

</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';

.form__item .imageForm {
    height: 100%;
}

</style>
