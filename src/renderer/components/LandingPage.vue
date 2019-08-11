<template>
	<div class="landing">
		<header class="head">
			<div class="setting-toolbar">
				<button @click="goToPaths()" type="primary">Settings</button>
			</div>
			<h1>
				Revan Editor
			</h1>
		</header>
		<span class="pad"></span>
		<nav class="tool">
			<button @click="extract()" type="primary">Export</button>
			<button>Edit</button>
		</nav>
		<tree-view class="TreeViewDemo left"
			:model="games"
			:selection="selection"
			:onSelect="onSelect"
			:display="display"
			category="children"
			ref="fileTree">
		</tree-view>
		<editor-tabs class="right"></editor-tabs>
	</div>
</template>

<script>

	const electron = require('electron')
	const fs = require('fs');

	const dialog = electron.remote.dialog;
	const app = electron.remote.app;
	import path from 'path'
	const _ = require('lodash');

	import { TreeView } from "@bosket/vue"
	import { string } from "@bosket/tools"

	const lotor = require('lotor').default;

	export default {
		name: 'landing-page',
		components: {
			"tree-view": TreeView,
			"editor-tabs": require('@/components/EditorTabs').default
		},
		created: function () {
			var me = this;
			me.filePath = path.join(app.getPath("userData"), '/RevanEditorPreferences.json');

			if(!fs.existsSync(me.filePath)){
				me.$router.push('GameSelection');
				return;
			}
			var json = JSON.parse(fs.readFileSync(me.filePath) );

			me.directories = json;

			me.games = me.loadGames();
			console.log(me.games)
		},

		data:function(){
			return {
				filePath: "",
				directories: [],
				games:[],
				// display: item => <a>{ item.label }</a>,
				selection:[],
				transition: {
					attrs: { appear: true },
					props: { name: "TreeViewDemoTransition" }
				}
			};
		},
		methods: {
			loadGames(){
				var me = this;
				var games = [];
				me.directories.forEach(function(directory){
					let game = lotor(directory.directory, fs, directory.title);
					if(game)
						games.push(game)
				})

				return games;
			},
			goToPaths(){
				this.$router.push('GameSelection');
			},
			onSelect(newSelection) {
				console.log('selection', newSelection);
				this.selection = newSelection
			},
			display(item) {
				console.log(item);
				return item.label;
			},

			extract(){
				var me = this;
				var file = me.$refs.fileTree.getCurrentNode();

				if(!file || file.leaf === undefined){
					console.log("select a file");
					return false;
				}

				var path = me.kotorPath;
				var index = 0;
				if(file.game === "tsl"){
					path = me.tslPath;
					index = 1;
				}

				dialog.showSaveDialog({defaultPath: file.fileName }, function(fileNames){
					if(!fileNames){
						return false;
					}

					var buffer;

					if(file.extractionType === 'erf'){
						buffer = me.extractErf(file, path, index);
					}
					else{
						buffer = me.extractBif(file, path, index);
					}

					fs.writeFileSync(fileNames, buffer);
				})

			},
		}
	}
</script>

<style>


.landing{
	height: 100%;
	display: grid;
	grid-template-rows: 50px 10px 50px 1fr;
	grid-template-columns: 300px 2fr;
	grid-column-gap: 30px;
	grid-template-areas:
		"head head"
		"tool pad"
		"tool right"
		"left right"
		"foot foot";
}

.setting-toolbar{
	display: grid;
	grid-template-columns: repeat(auto-fill, 80px);
	padding: 10px;
}
.setting-toolbar{

}

.head{
	grid-area: head;
	background-color: #333333;
	display: grid;
	grid-template-columns: 1fr auto;
}

.left{
	grid-area: left;
}
.tool{
	grid-area: tool;
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: repeat(auto-fill, 65px);
	grid-column-gap: 10px;
	padding: 12px 0px 12px 10px;
}

.right{
	grid-area: right;
}

h1{
	text-align: center;
	font-weight: 100;
	font-size: 20px;
	color:white;
	padding-right: 10px;
}

.el-tree{
	width: calc(100% - 100px);
	height: 100%;
}

.el-header{

	margin-bottom: 5px;
	padding-top: 10px;
}

.el-aside{
	width: 100px !important;
	top: 20%;
	display: inline-block;
	right: 0;
	position: fixed;
}

/* Search bar */

.TreeViewDemo>input[type="search"] {
    width: 100%;
    background: rgba(0, 0, 0, 0.05);
    height: 3em;
    border-width: 2px;
    transition: border 0.5s;
}

/* Elements */

.TreeViewDemo {
    box-shadow: 0px 0px 10px #DADADA;
    white-space: nowrap;
}

.TreeViewDemo ul {
    list-style: none;
}

.TreeViewDemo li {
    min-width: 100px;
    transition: all 0.25s ease-in-out;
}

.TreeViewDemo ul li a {
    color: #222;
}

.TreeViewDemo ul li>.item>a {
    display: inline-block;
    vertical-align: middle;
    width: calc(100% - 55px);
    margin-right: 30px;
    padding: 10px 5px;
    text-decoration: none;
    transition: all 0.25s;
}

.TreeViewDemo ul li:not(.disabled) {
    cursor: pointer;
}

.TreeViewDemo ul li.selected>.item>a {
    color: crimson;
}

.TreeViewDemo ul li.selected>.item>a:hover {
    color: #aaa;
}

.TreeViewDemo ul li:not(.disabled)>.item>a:hover {
    color: #e26f6f;
}


/* Root elements */

.TreeViewDemo ul.depth-0 {
    padding: 20px;
    margin: 0;
    background-color: rgba(255, 255, 255, 0.4);
    user-select: none;
    transition: all 0.25s;
}


/* Categories : Nodes with children */

.TreeViewDemo li.category>.item {
    display: block;
    margin-bottom: 5px;
    transition: all 0.25s ease-in-out;
}

.TreeViewDemo li.category:not(.folded)>.item {
    border-bottom: 1px solid crimson;
}


/* Category opener */

.TreeViewDemo .opener {
    display: inline-block;
    vertical-align: middle;
    font-size: 20px;
    cursor: pointer;
}

.TreeViewDemo .opener::after {
    content: '+';
    display: block;
    transition: all 0.25s;
    font-family: monospace;
}

.TreeViewDemo li.category.async>.item>.opener::after {
    content: '!';
}

.TreeViewDemo .opener:hover {
    color: #e26f6f;
}

.TreeViewDemo li.category:not(.folded)>.item>.opener::after {
    color: crimson;
    transform: rotate(45deg);
}

@keyframes spin {
    from {
        transform: rotate(0deg)
    }
    to {
        transform: rotate(360deg)
    }
}

.TreeViewDemo li.category.loading>.item>.opener::after {
    animation: spin 1s infinite;
}


/* Animations on fold / unfold */

.TreeViewDemoTransition-enter, .TreeViewDemoTransition-leave-to {
    opacity: 0;
    transform: translateX(-50px);
}

.TreeViewDemoTransition-enter-active, .TreeViewDemoTransition-leave-active {
    transition: all .3s ease-in-out;
}


/* Drag'n'drop */

.TreeViewDemo li.dragover, .TreeViewDemo ul.dragover {
    box-shadow: 0px 0px 5px #CCC
}

.TreeViewDemo ul.dragover {
    background-color: rgba(200, 200, 200, 0.3);
}

.TreeViewDemo li.dragover {
    background-color: rgba(100, 100, 100, 0.05);
    padding: 0px 5px;
}

.TreeViewDemo li.dragover>span.item {
    border-color: transparent;
}

.TreeViewDemo li.nodrop {
    box-shadow: 0px 0px 5px crimson;
    background-color: rgba(255, 20, 60, 0.1);
    padding: 0px 5px;
}


</style>
