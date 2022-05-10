<template>
    <div v-if="errors">
        <div class="form-errors" v-for="error of errors" :key="error.$uid">
            <div class="form-errors__msg">{{ error.$message }}</div>
        </div>
    </div>
</template>
<script>

export default {
    name: "ErrorFormItemView",
    props: {
        errors: null
    }
}
</script>
<style scoped lang="scss">

.form-errors {
    text-align: left;
    font-size: 14px;
    color: var(--color-error);
    margin-top: 5px;
    .form-errors__msg {
        margin-left: 21px
    }
}

</style>