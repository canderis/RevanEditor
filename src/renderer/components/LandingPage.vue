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
			:model="bifFiles"
            category="files"
            :selection="selection"
            :onSelect="onSelect"
            :display="display" ref="fileTree"></tree-view>
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

	const lotor = require('lotor');
	console.log(lotor)

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
			console.log(me.directories);
			//
			// var bifFiles = [];
			// var kotor = {fileName:'KotOR', files:[]};
			// var tsl = {fileName:'TSL', files:[]};
			//
			// if(me.kotorPath){
			// 	console.log(new lotor.lotor(me.kotorPath, fs));
			// 	// console.log(new lotor.erf(me.kotorPath, fs));
			//
			// 	//kotor.files.push( {fileName:'BIFs', leaf: false, files: me.parseChitinKey(me.kotorPath) });
			// 	//kotor.files.push( {fileName:'ERFs', leaf: false, files: me.readErfs(me.kotorPath) });
			// }
			//
			// if(me.tslPath){
			// 	//tsl.files.push( {fileName:'BIFs', leaf: false, files: me.parseChitinKey(me.tslPath) });
			// 	//tsl.files.push( {fileName:'ERFs', leaf: false, files: me.readErfs(me.tslPath) });
			// }
			//
			//
			//
			// bifFiles.push(kotor);
			// bifFiles.push(tsl);
			//
			// me.bifFiles = bifFiles;
			//
			// console.log(bifFiles)
		},

		data:function(){
			return {
				emptyText: "Please open a key",
				filePath: "",
				directories: [],
				bifFiles:[],
				selection:[],
				transition: {
	                attrs: { appear: true },
	                props: { name: "TreeViewDemoTransition" }
				},
				fileExtensionLookup: {
					'1':    {fileExtension: 'bmp', editors:[]},
					'3':    {fileExtension: 'tga', editors:[]},
					'0':    {fileExtension: 'res', editors:[]},
					'4':    {fileExtension: 'wav', editors:[]},
					'6':    {fileExtension: 'plt', editors:[]},
					'7':    {fileExtension: 'ini', editors:[]},
					'8':    {fileExtension: 'mp3', editors:[]},
					'9':    {fileExtension: 'mpg', editors:[]},
					'10':   {fileExtension: 'txt', editors:[]},
					'11':   {fileExtension: 'wma', editors:[]},
					'12':   {fileExtension: 'wmv', editors:[]},
					'13':   {fileExtension: 'xmv', editors:[]},
					'2000': {fileExtension: 'plh', editors:[]},
					'2001': {fileExtension: 'tex', editors:[]},
					'2002': {fileExtension: 'mdl', editors:[]},
					'2003': {fileExtension: 'thg', editors:[]},
					'2005': {fileExtension: 'fnt', editors:[]},
					'2007': {fileExtension: 'lua', editors:[]},
					'2008': {fileExtension: 'slt', editors:[]},
					'2009': {fileExtension: 'nss', editors:[]},
					'2010': {fileExtension: 'ncs', editors:[]},
					'2011': {fileExtension: 'mod', editors:[]},
					'2012': {fileExtension: 'are', editors:[]},
					'2013': {fileExtension: 'set', editors:[]},
					'2014': {fileExtension: 'ifo', editors:[]},
					'2015': {fileExtension: 'bic', editors:[]},
					'2016': {fileExtension: 'wok', editors:[]},
					'2017': {fileExtension: '2da', editors:[]},
					'2018': {fileExtension: 'tlk', editors:[]},
					'2022': {fileExtension: 'txi', editors:[]},
					'2023': {fileExtension: 'git', editors:[]},
					'2024': {fileExtension: 'bti', editors:[]},
					'2025': {fileExtension: 'uti', editors:[]},
					'2026': {fileExtension: 'btc', editors:[]},
					'2027': {fileExtension: 'utc', editors:[]},
					'2029': {fileExtension: 'dlg', editors:[]},
					'2030': {fileExtension: 'itp', editors:[]},
					'2031': {fileExtension: 'btt', editors:[]},
					'2032': {fileExtension: 'utt', editors:[]},
					'2033': {fileExtension: 'dds', editors:[]},
					'2034': {fileExtension: 'bts', editors:[]},
					'2035': {fileExtension: 'uts', editors:[]},
					'2036': {fileExtension: 'ltr', editors:[]},
					'2037': {fileExtension: 'gff', editors:[]},
					'2038': {fileExtension: 'fac', editors:[]},
					'2039': {fileExtension: 'bte', editors:[]},
					'2040': {fileExtension: 'ute', editors:[]},
					'2041': {fileExtension: 'btd', editors:[]},
					'2042': {fileExtension: 'utd', editors:[]},
					'2043': {fileExtension: 'btp', editors:[]},
					'2044': {fileExtension: 'utp', editors:[]},
					'2045': {fileExtension: 'dft', editors:[]},
					'2046': {fileExtension: 'gic', editors:[]},
					'2047': {fileExtension: 'gui', editors:[]},
					'2048': {fileExtension: 'css', editors:[]},
					'2049': {fileExtension: 'ccs', editors:[]},
					'2050': {fileExtension: 'btm', editors:[]},
					'2051': {fileExtension: 'utm', editors:[]},
					'2052': {fileExtension: 'dwk', editors:[]},
					'2053': {fileExtension: 'pwk', editors:[]},
					'2054': {fileExtension: 'btg', editors:[]},
					'2055': {fileExtension: 'utg', editors:[]},
					'2056': {fileExtension: 'jrl', editors:[]},
					'2057': {fileExtension: 'sav', editors:[]},
					'2058': {fileExtension: 'utw', editors:[]},
					'2059': {fileExtension: '4pc', editors:[]},
					'2060': {fileExtension: 'ssf', editors:[]},
					'2061': {fileExtension: 'hak', editors:[]},
					'2062': {fileExtension: 'nwm', editors:[]},
					'2063': {fileExtension: 'bik', editors:[]},
					'2064': {fileExtension: 'ndb', editors:[]},
					'2065': {fileExtension: 'ptm', editors:[]},
					'2066': {fileExtension: 'ptt', editors:[]},
					'3000': {fileExtension: 'lyt', editors:[]},
					'3001': {fileExtension: 'vis', editors:[]},
					'3002': {fileExtension: 'rim', editors:[]},
					'3003': {fileExtension: 'pth', editors:[]},
					'3004': {fileExtension: 'lip', editors:[]},
					'3005': {fileExtension: 'bwm', editors:[]},
					'3006': {fileExtension: 'txb', editors:[]},
					'3007': {fileExtension: 'tpc', editors:[]},
					'3008': {fileExtension: 'mdx', editors:[]},
					'3009': {fileExtension: 'rsv', editors:[]},
					'3010': {fileExtension: 'sig', editors:[]},
					'3011': {fileExtension: 'xbx', editors:[]},
					'9997': {fileExtension: 'erf', editors:[]},
					'9998': {fileExtension: 'bif', editors:[]},
					'9999': {fileExtension: 'key', editors:[]}
				}
			};
		},
		methods: {
			goToPaths(){
				this.$router.push('GameSelection');
			},
			onSelect(newSelection) {
	            this.selection = newSelection
	        },
	        display(item) {
	            return item.fileName
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

			loadNode1(node, resolve) {
				if (node.level === 0) {
				  return resolve(node.data);
				}
				resolve(node.data.files);
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
