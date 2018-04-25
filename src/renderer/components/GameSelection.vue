<template>
	<div id="wrapper">
		<main>
			<h1 class="title">
				Revan Editor
			</h1>
			<br />
			<p>Please select the games' directories:</p>
			<!-- <el-form label-width="120px" class="demo-dynamic"> -->
			  <!-- <el-form-item style="margin-right: 40px;" prop="kotorPath"  label="KotOR Path"> -->
				<input disabled v-model="kotorPath">
					<button slot="append" @click="browse('kotor')">...</button>
				</input>
			  <!-- </el-form-item> -->
			  <!-- <el-form-item style="margin-right: 40px;" prop="tslPath" label="TSL Path"> -->
				<input disabled v-model="tslPath">
					<button @click="browse('tsl')" slot="append">...</button>
				</input>
			  <!-- </el-form-item> -->

			  <!-- <el-form-item> -->
				<button type="primary" @click="save()">Save</button>
			  <!-- </el-form-item> -->
			<!-- </el-form> -->
		</main>
	</div>
</template>

<script>

const electron = require('electron')
const fs = require('fs');

const dialog = electron.remote.dialog;
const app = electron.remote.app;
import path from 'path'

export default {
	name: 'landing-page',
	data:function(){
		return {
			kotorPath: "",
			tslPath: "",
			filePath: "",
		}
	},
	methods: {
		browse: function(game){
			var me = this;
			dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Please select the directory for ' + game },
				function (fileNames) {
					if(!fileNames || fileNames.length < 1){
						return false;
					}

					let directory = fileNames[0];

					if(game==='tsl'){
						fs.readdir(directory, function (err, data) {
							if (err) return console.log(err)

							let key = data.find(function (row) {
								return row === 'chitin.key';
							})

							if (!key) {
								console.log('invalid directory');
								return false;
							}

							let game = data.find(function (row) {
								return row === 'swkotor2.ini';
							});

							if (game !== 'swkotor2.ini') {
								console.log('invalid directory: k1 as k2');
								return false;
							}

							me.tslPath = directory;
						});
					}
					else{
						fs.readdir(directory, function (err, data) {
							if (err) return console.log(err);

							let key = data.find(function (row) {
								return row === 'chitin.key';
							})

							if (!key) {
								console.log('invalid directory');
								return false;
							}

							let game = data.find(function (row) {
								return row === 'swkotor2.ini';
							});

							if (game === 'swkotor2.ini') {
								console.log('invalid directory: k2 as k1');
								return false;
							}

							me.kotorPath = directory;
						});
					}
				}
			);

		},
		save: function(){
			var me = this;
			fs.writeFileSync(me.filePath, JSON.stringify({kotorPath:me.kotorPath, tslPath:me.tslPath}) );

			this.$router.push('/');
		}
	},
	created: function () {
		var me = this;

		me.filePath = path.join(app.getPath("userData"), '/RevanEditorPreferences.json');

		if( !fs.existsSync(me.filePath) ){
			fs.writeFileSync(me.filePath, JSON.stringify({kotorPath:"", tslPath:""}) );
		}
		else{
			var json = JSON.parse(fs.readFileSync(me.filePath) );
			me.kotorPath = json.kotorPath;
			me.tslPath = json.tslPath;
		}
	},
}
</script>

<style>
.title{

	font-size: 50px;
	font-weight: 100;
	width: 100%;
	text-align: center;

}
p{
	font-weight: 300;
	margin-left: 30px;
}
p, .title{
	font-family: "Helvetica Neue",Helvetica;

}
</style>
