<template>
	<div class="game-selection">
		<p>Please select the games' directories:</p>
		<div class="label-list">
			<label style="padding-left: 20px;">Directory Title:</label>
			<label>Directory:</label>
		</div>
		<ul class="directory-list">
			<li class="directory-listing" v-for="directory in directories">
				<input v-model='directory.label' />
				<input disabled v-model='directory.path' />
				<button slot="append" @click="browse(directory)">...</button>
			</li>
		</ul>
		<div class="button-wrap">
			<button class="saveBtn" type="primary" @click="addDirectory()">Add Directory</button>
			<button class="saveBtn" type="primary" @click="save()">Save</button>
		</div>
	</div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

const remote = window.require('electron').remote;
const fs = remote.require('fs');
const electronDialog = remote.dialog;


const dialog = remote.dialog;
// const app = remote.app;
// const path = require('path');

@Component({
	name: 'settings',
	computed: {
		directories() {
			console.log(this.$store.state.directories)
			if(this.$store.state.directories.length < 1){
				return [
					{
						label: 'Kotor',
						path: ''
					},
					{
						label: 'TSL',
						path: ''
					}
				]
			}
			return this.$store.state.directories
		}
	},
	methods: {
		browse(directory) {
			dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Browse for game'},
				(fileNames: string[]) => {
				console.log(fileNames, directory);

					if(!fileNames || fileNames.length < 1){
						return false;
					}
					this.$store.commit('addDirectory', {label: directory.label, path:fileNames[0]})
				});
		},
		// save: function(){

		// 	fs.writeFileSync(this.filePath, JSON.stringify(this.directories) );

		// 	this.$router.push('/');
		// },
		addDirectory: function(){
			// this.directories.push({directory:'', title:'Kotor'});
		}
	},
	created: function () {


		// this.filePath = path.join(app.getPath("userData"), '/RevanEditorPreferences.json');

		// if( !fs.existsSync(this.filePath) ){
		// 	fs.writeFileSync(this.filePath, JSON.stringify({}) );
		// }
		// else{
		// 	this.directories = JSON.parse(fs.readFileSync(this.filePath) )
		// }
	},
})
export default class GameSelection extends Vue {}
</script>

<style lang="scss" scoped>

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

	p{
		font-weight: 300;
		margin-left: 30px;
	}
	p, .title{
		font-family: "Helvetica Neue",Helvetica;

	}
</style>
