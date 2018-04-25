<template>
	<div class="main">
		<h1 class="title">
			Revan Editor
		</h1>
		<div class="game-selection">
			<p>Please select the games' directories:</p>
			<div class="label-list">
				<label style="padding-left: 20px;">Directory Title:</label>
				<label>Directory:</label>
			</div>
			<ul class="directory-list">
				<li class="directory-listing" v-for="directory in directories">
					<input v-model='directory.title'>
					</input>
					<input disabled v-model='directory.directory'>
						<button slot="append" @click="browse(directory)">...</button>
					</input>
				</li>
			</ul>
			<div class="button-wrap">
				<button class="saveBtn" type="primary" @click="addDirectory()">Add Directory</button>
				<button class="saveBtn" type="primary" @click="save()">Save</button>
			</div>
		</div>
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
			filePath: "",
			directories: [{directory:'', title:'Kotor'}, {directory:'', title: 'TSL'}]
		}
	},
	methods: {
		browse: function(directory){
			var me = this;
			console.log(directory);
			dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Browse for game'},
				function (fileNames) {
					if(!fileNames || fileNames.length < 1){
						return false;
					}

					directory.directory = fileNames[0];

					//
					// let directory = fileNames[0];
					//
					// if(game==='tsl'){
					// 	fs.readdir(directory, function (err, data) {
					// 		if (err) return console.log(err)
					//
					// 		let key = data.find(function (row) {
					// 			return row === 'chitin.key';
					// 		})
					//
					// 		if (!key) {
					// 			console.log('invalid directory');
					// 			return false;
					// 		}
					//
					// 		let game = data.find(function (row) {
					// 			return row === 'swkotor2.ini';
					// 		});
					//
					// 		if (game !== 'swkotor2.ini') {
					// 			console.log('invalid directory: k1 as k2');
					// 			return false;
					// 		}
					//
					// 		me.tslPath = directory;
					// 	});
					// }
					// else{
					// 	fs.readdir(directory, function (err, data) {
					// 		if (err) return console.log(err);
					//
					// 		let key = data.find(function (row) {
					// 			return row === 'chitin.key';
					// 		})
					//
					// 		if (!key) {
					// 			console.log('invalid directory');
					// 			return false;
					// 		}
					//
					// 		let game = data.find(function (row) {
					// 			return row === 'swkotor2.ini';
					// 		});
					//
					// 		if (game === 'swkotor2.ini') {
					// 			console.log('invalid directory: k2 as k1');
					// 			return false;
					// 		}
					//
					// 		me.kotorPath = directory;
					// 	});
				});
		},
		save: function(){
			var me = this;
			fs.writeFileSync(me.filePath, JSON.stringify(this.directories) );

			me.$router.push('/');
		},
		addDirectory: function(){
			this.directories.push({directory:'', title:'Kotor'});
		}
	},
	created: function () {
		var me = this;

		me.filePath = path.join(app.getPath("userData"), '/RevanEditorPreferences.json');

		if( !fs.existsSync(me.filePath) ){
			fs.writeFileSync(me.filePath, JSON.stringify({}) );
		}
		else{
			me.directories = JSON.parse(fs.readFileSync(me.filePath) )
		}
	},
}
</script>

<style>

.button-wrap{
	margin: auto;
}

.label-list{
	display: grid;
   grid-template-columns: 1fr  2fr auto;
   grid-column-gap:10px;
}

.directory-listing{
	display: grid;
   grid-template-columns:  1fr  2fr auto;
   grid-column-gap: 10px;
   margin-bottom: 10px;

}

.directory-list{
	padding: 0;
	margin: 20px;
	margin-top: 10px;
	margin-bottom: 20px;
	/* display: grid;
	grid-template-columns: 1fr 1fr;
	grid-column-gap: 20px;
	grid-row-gap: 10px; */
}

.saveBtn{
	width: 170px;
    margin: auto;
    height: 40px;
}

.game-selection{
	display: grid;
	grid-template-rows: auto auto auto auto 1fr;

}
.main{
	display: grid;
	height: 100%;
	grid-template-rows: auto 1fr;
}

.title{

	font-size: 50px;
	font-weight: 100;
	width: 100%;
	text-align: center;
	color: black;

}
p{
	font-weight: 300;
	margin-left: 30px;
}
p, .title{
	font-family: "Helvetica Neue",Helvetica;

}
</style>
