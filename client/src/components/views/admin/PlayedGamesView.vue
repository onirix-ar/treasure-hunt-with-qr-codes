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
  <ConfirmView :params="confirmParams" @close="closeConfirmHandler" ></ConfirmView>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import firebaseService from "../../../services/firebase.service.js";
import { ColumnTypes } from "../../../ag-grid.utils.js";
import DeleteBoothButtonView from "./DeleteBoothButtonView.vue";
import ConfirmView from "../shared/ConfirmView.vue";

export default {
  name: "PlayedGamesView",
  components: {
    AgGridVue,
    deleteRenderer: DeleteBoothButtonView,
    ConfirmView
  },
  beforeMount() {
    this.columnDefs = [
      { headerName: "User", field: "userName" },
      { headerName: "Email", field: "email" },
      { headerName: "Company", field: "company" },
      { headerName: "Job title", field: "jobTitle" },
      { headerName: "Booth", field: "boothName" },
      { headerName: "Score", field: "score", type: ["numericColumn", "numberColumn"] },
      { headerName: "Played at", field: "playedAt", sort: "desc", type: "dateColumn"},
      {
        headerName: "Delete",
        field: "deleteCallback",
        cellRendererFramework: "deleteRenderer",
      }
    ];
  },
  data() {
    return {
      columnDefs: null,
      rowData: null,
      defaultColDef: { resizable: true, sortable: false, filter: true },
      columnTypes: ColumnTypes,
      gridApi: null,
      gridColumnApi: null,
      confirmParams: null,
    };
  },
  async created() {
    const playedGames = await firebaseService.getGames();
    this.reloadPlayedGames(playedGames);
  },
  methods: {
    reloadPlayedGames(playedGames) {
      const temp = playedGames.map((value) => value);
      this.rowData = temp.map((value) =>
        Object.assign(value, {
          userName: `${value.firstName} ${value.lastName}`,
          deleteCallback: () => {
            this.deleteHandler(value.userId, value.boothId);
          },
        })
      );
      this.getCsv();
    },
    deleteHandler(userId, boothId) {
      this.confirmParams = {
          visible: true,
          title: 'Delete game?',
          description: `Are you sure you want to delete the game?                
          You can’t undo this action.`,
          confirmHandler: () => this.deleteGame(userId, boothId)
      }
    },
    deleteGame(userId, boothId) {
      firebaseService.deleteGame(userId, boothId).then( () => {
        const index = this.rowData.findIndex( row => row.userId === userId && row.boothId === boothId);
        if (0 <= index) {
          this.rowData.splice(index, 1);
        }
        this.closeConfirmHandler();
      }).catch( (error) => {
        console.error(error);
        this.closeConfirmHandler();
      });
    },
    closeConfirmHandler() {
        this.confirmParams = {};
    },
    onFirstDataRendered() {
      this.gridColumnApi.autoSizeColumns();
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    getCsv() {
      const csvHeader = this.columnDefs.slice(0, -2);
      const infoArray = [csvHeader.map( col => col.headerName)];
      this.rowData.forEach((row) => {
          infoArray.push([csvHeader.map( col => row[col.field])]);
      });
      this.$emit(
        "csv",
        { 
          csv: encodeURI("data:text/csv;charset=utf-8," +infoArray.map((e) => e.join(",")).join("\n")),
          name: "playedGames.csv"
        }
      );
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../../../public/css/admin.scss';
</style>