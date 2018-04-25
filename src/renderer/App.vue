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
  #app{
      width: 100%;
      height: 100%;
  }
  body, html{
      height: 100%;
      font-family: "Helvetica Neue",Helvetica;
  }

  button{
    display: inline-block;
    border-width: 0;
    outline: none;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .6);

    background-color: #2ecc71;
    color: #ecf0f1;

    cursor: pointer;

    transition: background-color .3s;
    box-sizing: content-box;

  }
</style>
