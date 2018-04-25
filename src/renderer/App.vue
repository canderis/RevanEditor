<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'revaneditor'
  }
</script>

<style>
  /* CSS */
  #app, body{
      width: 100%;
      height: 100%;
  }
  html{
      height: calc(100% - 10px);
  }

  body, html{
      font-family: "Helvetica Neue",Helvetica;
      margin: 0;
  }

  button{
    display: inline-block;
    border-width: 0;
    outline: none;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .6);

    background-color: #1976d2;
    color: #ecf0f1;

    cursor: pointer;

    transition: background-color .3s;
  }

  li{
      list-style-type: none;
  }
</style>
