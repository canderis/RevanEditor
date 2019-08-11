<template>
	<div class="main">
		<div class="title">
			<img src="../assets/Revan.png" /> <h1>Revan Editor</h1>
		</div>
		<ul>
			<li><button @click="newProject()" class="btn primary">New Project</button></li>
			<li><button class="btn secondary outline">Open Project</button></li>
			<li><button class="btn secondary outline">Browse Game Files</button></li>
			<li><button class="btn secondary outline">Settings</button></li>
		</ul>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

const remote = window.require('electron').remote;
const fs = remote.require('fs');
const electronDialog = remote.dialog;



console.log(fs)

const dialog = remote.dialog;
// const app = remote.app;
// const path = require('path');

@Component({
	// name: 'landing-page',
	methods: {
		newProject() {
			if(this.$store.state.directories.length < 1) {
				console.log('no directories');
				this.$router.push({path: 'settings'})
			}
		}
	}
})
export default class Home extends Vue {

}
</script>


<style lang="scss" scoped>
.main {
	padding: 32px;
	display: grid;
	grid-gap: 32px;
}
.title {
	margin: auto;
	display: grid;
	// grid-template-columns: auto auto;
	width: fit-content;
	grid-gap: 16px;
	h1{
		font-size: 50px;
		font-weight: 100;
		text-align: center;

		margin: 0;
	}


	img {
		margin: auto;
		height: 100px;
	}
}

ul {
	display: grid;
	grid-gap: 16px;
	padding: 0;
}

button {
	width: 200px;
	height: 50px;
	font-size: 16px;
}
</style>
