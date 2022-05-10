<template>
  <div class="layout--users">
    <div class="content">
      <inline-svg :src="require('@/assets/error.svg')"></inline-svg>
      <h1>An error has occurred</h1>
      <p>{{ message }}</p>
    </div>
    <div class="footer">
      <inline-svg
        class="logo"
        :src="require('@/assets/ar-view-logo-purple.svg')"
      ></inline-svg>
    </div>
  </div>
</template>

<script>
import analyticsService from "../../../services/analytics.service";

export default {
  name: "ErrorView",
  props: {
    message: {
      default: "Page not found",
      type: String,
    },
  },
  created() {
    analyticsService.sendEvent("error_view", { error: this.message });
  },
};
</script>

<style scoped lang="scss">
@import '../../../../public/css/vars.css'; 

.footer {
  align-items: center;
}

.content {
  display: flex;
  height: calc(100% - 64px);
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0px 10px;

  color: var(--color-font-dark);

  h1 {
    font-size: 27px;
    font-weight: 800;

    margin-top: 24px;
    margin-bottom: 10px;
  }
  p {
    margin: 0px;
    font-size: 18px;
  }
}
</style>

