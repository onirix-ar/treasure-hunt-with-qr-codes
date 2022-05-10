<template>
  <div class="imageForm" :style="imageBackground" >
    <button v-if="null == imageBackground" class="link" @click="selectImageHandler">Select image</button>
    <button v-if="null != imageBackground" class="link remove" @click="removeImageHandler">Remove image</button>
    <input ref="inputFile" type="file" accept="image/*" @change="imageFileChangeHandler($event)" />
  </div>
</template>
<script>
export default {
  name: "ImageFormView",
  props: {
    imageUrl: null,
  },
  data() {
    return {
      imgFilename: null,
      imgBase64: null,
      imageBackground: null,
    };
  },
  created() {
      if (null != this.imageUrl && 0 < this.imageUrl.length) {
          this.imageBackground = `background-image: url(${this.imageUrl})`;
      }
  },
  methods: {
    async imageFileChangeHandler(eventObject) {
      const file = eventObject.target.files[0];
      const reader = new FileReader();
      this.imgFilename = file.name;
      reader.onload = async () => {
        this.imageBackground = `background-image: url(${reader.result})`;
        const index = reader.result.indexOf(",");
        if (0 <= index) {
          this.imgBase64 = reader.result.substring(index + 1);
        } else {
          this.imgBase64 = reader.result;
        }
        this.emitChange();
      };
      reader.readAsDataURL(file);
    },
    selectImageHandler() {
        this.$refs.inputFile.click();
    },
    removeImageHandler() {
        this.imageBackground = null;
        this.imgBase64 = null;
        this.imgFilename = null;
        this.emitChange();
    },
    emitChange() {
        this.$emit('change', {
            fileName: this.imgFilename,
            base64: this.imgBase64
        })
    }
  },
};
</script>
<style scoped lang="scss" >

.imageForm {
    width: 400px;
    height: 125px;
    border-radius: 5px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    background-color: var(--color-form-background);
    border: 1px dashed var(--color-form-border);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &:hover button.remove {
        display: block;
    }
}

input[type="file"] {
    display: none;
}

button.remove {
    display: none;
    background-color: #FFF;
}

</style>