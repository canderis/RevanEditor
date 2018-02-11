<template>
	<div id="wrapper">
		<main>
            <h1>
                Revan Editor
            </h1>
            <br />
            <p>Please select the games' directories:</p>
            <el-form :model="dynamicValidateForm" ref="dynamicValidateForm" label-width="120px" class="demo-dynamic">
              <el-form-item style="margin-right: 40px;" prop="email" label="KotOR Path">
                <el-input v-model="dynamicValidateForm.email">
                    <template slot="append">...</template>
                </el-input>
              </el-form-item>
              <el-form-item style="margin-right: 40px;" prop="email" label="TSL Path">
                <el-input v-model="dynamicValidateForm.email">
                    <template slot="append">...</template>
                </el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitForm('dynamicValidateForm')">Save</el-button>
              </el-form-item>
            </el-form>
		</main>
	</div>
</template>

<script>

const electron = require('electron');
const fs = require('fs');

const dialog = electron.remote.dialog;

export default {
	name: 'landing-page',
	data:function(){
		return {
            dynamicValidateForm: {
          domains: [{
            key: 1,
            value: ''
          }],
          email: ''
        }
		};
	},
	methods: {
    }
}
</script>

<style>
h1{

    font-size: 50px;
    font-weight: 100;
    width: 100%;
    text-align: center;

}
p{
    font-weight: 300;
    margin-left: 30px;
}
p, h1{
    font-family: "Helvetica Neue",Helvetica;

}
</style>
