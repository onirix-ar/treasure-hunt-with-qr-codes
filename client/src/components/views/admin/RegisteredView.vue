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
import firebaseService from "../../../services/firebase.service.js";
import { ColumnTypes } from "../../../ag-grid.utils.js";

export default {
  name: "RegisteredView",
  components: {
    AgGridVue,
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
  async beforeMount() {
    this.columnDefs = [
      { headerName: "User", field: "userName" },
      { headerName: "Email", field: "email" },
      { headerName: "Company", field: "company" },
      { headerName: "Job title", field: "jobTitle" },
      { headerName: "Played games", field: "played" },
    ];
    
    const users = await firebaseService.getUsers();
    this.reloadUsers(users);
  },
  methods: {
    reloadUsers(users) {
      const temp = users.map((value) => value);
      this.rowData = temp.map((value) =>
        Object.assign(value, {
          userName: `${value.firstName} ${value.lastName}`,
          played: value.playedGames.length,
        })
      );
      this.getCsv();
    },
    onFirstDataRendered() {
      this.gridColumnApi.autoSizeColumns();
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    getCsv() {
      const infoArray = [this.columnDefs.map((col) => col.headerName)];
      this.rowData.forEach((row) => {
        infoArray.push([this.columnDefs.map((col) => row[col.field])]);
      });
      this.$emit(
        "csv",
        { 
          csv: encodeURI(
            "data:text/csv;charset=utf-8," +
              infoArray.map((e) => e.join(",")).join("\n")
            ),
          name: "registered.csv"
        }
      );
    },
  },
};
</script>
<style scoped lang="scss">
@import "../../../../public/css/admin.scss";
</style>