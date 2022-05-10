<template>
    <ag-grid-vue
      style="width: 100%; height: 100%"
      class="ag-theme-alpine"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :defaultColDef="defaultColDef"
      :columnTypes="columnTypes"
      @grid-ready="onGridReady"
      @first-data-rendered="onFirstDataRendered"
    >
    </ag-grid-vue>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { ColumnTypes } from "../../../ag-grid.utils.js";
import Constants from "../../../constants";
import EditBoothButtonView from "./EditBoothButtonView.vue";
import DeleteBoothButtonView from "./DeleteBoothButtonView.vue";
import QrCodeGoogleLinkView from "./QrCodeGoogleLinkView.vue";
import GameLinkView from "./GameLinkView.vue";

export default {
  name: "BoothsView",
  components: {
    AgGridVue,
    editBoothRenderer: EditBoothButtonView,
    deleteBoothRenderer: DeleteBoothButtonView,
    qrCodeRenderer: QrCodeGoogleLinkView,
    gameLinkRenderer: GameLinkView
  },
  beforeMount() {
    this.columnDefs = [
      { headerName: "Logo", field: "logoUrl", type: "imageColumn" },
      { headerName: "Name", field: "name"},
      { headerName: "Description", field: "description" },
      { headerName: "Location", field: "location" },
      { 
        headerName: "Game link",
        field: "gameLink",
        cellRendererFramework: "gameLinkRenderer",
      },
      { 
        headerName: "QR",
        field: "qrLink",
        cellRendererFramework: "qrCodeRenderer",
      },
      {
        headerName: "Edit",
        field: "editCallback",
        cellRendererFramework: "editBoothRenderer",
      },
      {
        headerName: "Delete",
        field: "deleteCallback",
        cellRendererFramework: "deleteBoothRenderer",
      },
    ];
  },
  props: {
    booths: Array,
    formHandler: Function,
    deleteHandler: Function
  },
  data() {
    return {
      columnDefs: null,
      rowData: null,
      defaultColDef: { resizable: true, sortable: false, filter: true },
      columnTypes: ColumnTypes,
      gridApi: null,
      gridColumnApi: null
    };
  },
  watch: {
    booths: function (values) {
      this.reloadBooths(values);
    },
  },
  created() {
    this.reloadBooths(this.booths);
  },
  methods: {
    reloadBooths(data) {
      if (null == data || 1 > data.length) {
        this.rowData = [];
        return;
      }
      this.rowData = data.map((value) => {
        const playLink = `${Constants.VUE_APP_IH_HOST}/play/${encodeURIComponent(value.id)}`;
        return Object.assign(value, {
          gameLink: playLink,
          qrLink: playLink,
          editCallback: () => {
            this.formHandler(this.booths.find( p => p.id === value.id));
          },
          deleteCallback: () => {
            this.deleteHandler(this.booths.find( p => p.id === value.id));
          },
        });
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
.booths {
  height: 100%;
  width: 100%;
}
</style>