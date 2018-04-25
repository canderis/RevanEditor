<template>
	<div>
		<header>
			<button @click="goToPaths()" type="primary">Paths</button>
			<h1>
				Revan Editor
			</h1>
		</header>

		<tree-view class="TreeViewDemo"
			:model="bifFiles"
            category="files"
            :selection="selection"
            :onSelect="onSelect"
            :display="display" ref="fileTree"></tree-view>

		<div>
			<button @click="extract()" type="primary">Export</button>
		</div>
		<editor-tabs></editor-tabs>
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
		me.kotorPath = json.kotorPath;
		me.tslPath = json.tslPath;
		if(!me.kotorPath && !me.tslPath){
			me.$router.push('GameSelection');
			return;
		}

		var bifFiles = [];
		var kotor = {fileName:'KotOR', files:[]};
		var tsl = {fileName:'TSL', files:[]};

		if(me.kotorPath){
			me.currentGame = "k1";
			kotor.files.push( {fileName:'BIFs', leaf: false, files: me.parseChitinKey(me.kotorPath) });
			kotor.files.push( {fileName:'ERFs', leaf: false, files: me.readErfs(me.kotorPath) });
		}
		if(me.tslPath){
			me.currentGame = "tsl";
			tsl.files.push( {fileName:'BIFs', leaf: false, files: me.parseChitinKey(me.tslPath) });
			tsl.files.push( {fileName:'ERFs', leaf: false, files: me.readErfs(me.tslPath) });
		}

		me.currentGame = "";

		bifFiles.push(kotor);
		bifFiles.push(tsl);

		me.bifFiles = bifFiles;

		console.log(bifFiles)
	},

	data:function(){
		return {
			emptyText: "Please open a key",
			filePath: "",
			kotorPath: "",
			tslPath: "",
			currentGame: "",
			erf_sizes: {
				header: 44,
				key: 24,
				resource: 8,
			},
			bifFiles:[],
			selection:[],
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

		extractErf( file, path, gameIndex ) {
			var me = this;

			var resoucePath = me.bifFiles[gameIndex].files[1];

			var index = _.findIndex(resoucePath, 'fileName', file.erfFileName);

			var fd = fs.openSync(path + "/" + "TexturePacks/" + file.erfFileName, 'r');

			let buf = new Buffer(file.size);
			fs.readSync( fd, buf, 0, file.size, file.offset );
			return buf;
		},

		extractBif( file, path, index ){
			var me = this;

			var fd = fs.openSync(path + "/" + me.bifFiles[index].files[0].files[file.bifIndex].bif_filename.trim().replace(/\\/g,"/").replace(/\0/g, ''), 'r');

			var buffer = new Buffer(20);
			fs.readSync(fd, buffer, 0, 20, 0 );

			var bifHeader = {
				number_of_variable_resources: buffer.readUInt32LE(8),
				number_of_fixed_resouces: buffer.readUInt32LE(12),
				offset_to_variable_resouces: buffer.readUInt32LE(16)
			};


			buffer = new Buffer(16);
			fs.readSync(fd, buffer, 0, 16, bifHeader.offset_to_variable_resouces + 16*file.indexOfFileInBif );
			var variableTable = {
				id: buffer.readUInt32LE(0),
				offset_into_variable_resource_raw_data: buffer.readUInt32LE(4),
				size_of_raw_data_chunk: buffer.readUInt32LE(8),
				resource_type: buffer.readUInt32LE(12)
			};

			buffer = new Buffer(variableTable.size_of_raw_data_chunk);
			fs.readSync(fd, buffer, 0, variableTable.size_of_raw_data_chunk, variableTable.offset_into_variable_resource_raw_data );

			return buffer;

		},

		loadNode1(node, resolve) {
			if (node.level === 0) {
			  return resolve(node.data);
			}
			resolve(node.data.files);
		},

		parseChitinKey (directory) {
			var me = this;

			var fd = fs.openSync(directory + '/chitin.key', 'r');

			me.chitinHeader = me.readChitinHeader(fd);
			var bifFiles = me.parseBifFileDataInChitin(fd, me.chitinHeader);
			bifFiles = me.parseTableOfKeys(fd, me.chitinHeader, bifFiles, me.fileExtensionLookup);

			fs.closeSync(fd);
			return bifFiles;
		},

		readChitinHeader (fd) {
			var me = this;
			let buffer = new Buffer(60);
			fs.readSync(fd, buffer, 0, 60, 0 );

			return {
				number_of_bif_files: buffer.readUInt32LE(8),
				number_of_entries_in_chitin_key: buffer.readUInt32LE(12),
				offset_to_table_of_files: buffer.readUInt32LE(16),
				offset_to_table_of_keys: buffer.readUInt32LE(20),
				build_year: buffer.readUInt32LE(24),
				build_day: buffer.readUInt32LE(28),
				header_length: 60
			};
		},

		parseBifFileDataInChitin (fd, chitinHeader) {
			var me = this;
			var bifFiles = [];
			for (let i = 0; i < chitinHeader.number_of_bif_files; i++) {
				var bif = {};
				let buffer = new Buffer(12);
				fs.readSync(fd, buffer, 0, 12, chitinHeader.offset_to_table_of_files + (i * 12));

				var bif = {
					size_of_file: buffer.readUInt32LE(0),
					offset_into_filename_table_for_filename: buffer.readUInt32LE(4),
					length_of_filename: buffer.readUInt16LE(8),
					bif_drive: buffer.readUInt16LE(10),
				};

				let filenameBuffer = new Buffer(bif.length_of_filename);
				fs.readSync(fd, filenameBuffer, 0, bif.length_of_filename, bif.offset_into_filename_table_for_filename);

				var fileName = filenameBuffer.toString();
				bif.bif_filename = fileName;
				bif.fileName = fileName.replace("data\\", '').trim().replace(/\0/g, '');

				bifFiles.push(bif);

			}

			return bifFiles;
		},

		parseTableOfKeys(fd, chitinHeader, bifFiles, fileExtensionLookup){
			var me = this;
			for (let i = 0; i < chitinHeader.number_of_entries_in_chitin_key; i++) {
				let buffer = new Buffer(22);
				fs.readSync(fd, buffer, 0, 22, chitinHeader.offset_to_table_of_keys + (i * 22));

				let file = {
					resref: buffer.toString('utf8', 0, 16),
					file_extension_code: buffer.readUInt16LE(16),
					uniqueId: buffer.readUInt32LE(18),
					leaf: true,
					game: me.currentGame
				};

				file.bifIndex = file.uniqueId >> 20
				file.indexOfFileInBif = file.uniqueId - (file.bifIndex << 20)

				file.fileExtension = fileExtensionLookup[file.file_extension_code].fileExtension;
				file.fileName = file.resref + "." + file.fileExtension;
				file.fileName = file.fileName.trim().replace(/\0/g, '')


				if(!bifFiles[file.bifIndex]) console.log('Error File!!!', file);

				if(!bifFiles[file.bifIndex].files) bifFiles[file.bifIndex].files = [];

				bifFiles[file.bifIndex].files.push(file);
			}

			bifFiles.forEach(function(ele){
				if(ele.files.length >= 100){
					var sorted = {};
					ele.files.forEach(function(file){
						if(!sorted[file.fileExtension]){
							sorted[file.fileExtension] = [];
						}
						sorted[file.fileExtension].push(file);
					})


					//_.forEach(sorted, function(resourceType){
					for(var resourceTypeKey in sorted){
						if(sorted[resourceTypeKey].length >= 100){
							//alphabetize
							var alphabetized = {};
							sorted[resourceTypeKey].forEach( function(file){
								var letterKey = file.fileName.charAt(0);
								if(!alphabetized[letterKey]){
									alphabetized[letterKey] = [];
								}
								alphabetized[letterKey].push(file);
							});

							var alphabetizedFiles = [];
							for(var key in alphabetized ){
								alphabetizedFiles.push({files: alphabetized[key], fileName: key + ' (' + alphabetized[key].length + ')'});
							}

							sorted[resourceTypeKey] = alphabetizedFiles;
						}
					}

					var files = [];
					for(var key in sorted ){
						files.push({files: sorted[key], fileName: key});
					}



					ele.files = files;
				}

			})

			return bifFiles;
		},

		readErfs(directory){
			var me = this;
			var data = fs.readdirSync(directory + '/TexturePacks');
			var erfs = [];
			data.forEach(function(fileName){
				erfs.push(me.read_erf_file(directory + '/TexturePacks/', fileName));
			});



			return erfs;
		},

		read_erf_file(directory, fileName) {
			let me = this;
			let erf = {};
			let fd = fs.openSync(directory + fileName, 'r');
			let buf = new Buffer(me.erf_sizes.header);
			fs.readSync(fd, buf, 0, me.erf_sizes.header);
			erf.fileName = fileName;
			erf.header = me.read_erf_header(buf);
			if (erf.header.language_count) {
				//buf = new Buffer(erf.header.offset_to_key_list - erf.header.offset_to_localized_string);
				console.log('localized string size: ' + erf.header.localized_string_size);
				buf = new Buffer(erf.header.localized_string_size);
				fs.readSync(fd, buf, 0, erf.header.localized_string_size, erf.header.offset_to_localized_string);
				erf.strings = me.erf_read_localized_strings(buf, erf);
			}
			if (!erf.header.entry_count) {
				return erf;
			}
			buf = new Buffer(erf.header.entry_count * (me.erf_sizes.key + me.erf_sizes.resource));
			fs.readSync(fd, buf, 0, erf.header.entry_count * (me.erf_sizes.key + me.erf_sizes.resource), erf.header.offset_to_key_list);
			erf.files = me.read_erf_resources(buf, erf, fileName);
			erf.leaf = false;

			fs.closeSync(fd);

			if(erf.files.length >= 100 ){
				//alphabetize
				var alphabetized = {};
				erf.files.forEach( function(file){
					var letterKey = file.fileName.charAt(0).toUpperCase();
					if(!alphabetized[letterKey]){
						alphabetized[letterKey] = [];
					}
					alphabetized[letterKey].push(file);
				});

				var alphabetizedFiles = [];
				for(var key in alphabetized ){
					alphabetizedFiles.push({files: alphabetized[key], fileName: key + ' (' + alphabetized[key].length + ')'});
				}

				erf.files = alphabetizedFiles;
			}
			return erf;
		},

		read_erf_header(buf) {
			let erf = {};
			erf.type = buf.slice(0, 4).toString().trim().toLowerCase();
			erf.version_string = buf.slice(4, 8).toString().trim().toLowerCase();
			erf.language_count = buf.readUInt32LE(8, 12);
			erf.localized_string_size = buf.readUInt32LE(12, 16);
			erf.entry_count = buf.readUInt32LE(16, 20);
			erf.offset_to_localized_string = buf.readUInt32LE(20, 24);
			erf.offset_to_key_list = buf.readUInt32LE(24, 28);
			erf.offset_to_resource_list = buf.readUInt32LE(28, 32);
			erf.build_year = buf.readUInt32LE(32, 36);
			erf.build_day = buf.readUInt32LE(36, 40);
			erf.description_str_ref = buf.readUInt32LE(40, 44);
			return erf;
		},

		erf_read_localized_strings(buf, erf) {
			let str = {};
			// read a string
			let lang_id = buf.readUInt32LE(0, 4);
			let feminine = false;
			if (lang_id % 2) {
			feminine = true;
			lang_id -= 1;
			}
			lang_id /= 2;
			//TODO select an encoding based on language ID
			// let str_size = buf.readUInt32LE(4, 8);
			// // let s = buf.slice(8, 8 + str_size);
			// // if (s.charCodeAt(s.length - 1) === 0) {
			// // 	s = s.slice(0, -1);
			// // }
			return str;
		},

		read_erf_resources(buf, erf, fileName) {
			let keys = [];
			for (let i = 0; i < erf.header.entry_count; i++) {
				let key = {};
				let keypos = i * this.erf_sizes.key;
				key.fileName = buf.slice(keypos, keypos + 16).toString().replace(/\0+$/, '');
				key.res_id = buf.readUInt32LE(keypos + 16, keypos + 20);
				key.res_type = this.fileExtensionLookup[buf.readUInt16LE(keypos + 20, keypos + 22)].fileExtension;
				let res = {};
				let respos = erf.header.entry_count * this.erf_sizes.key + (i * this.erf_sizes.resource);
				res.offset = buf.readUInt32LE(respos, respos + 4);
				res.size = buf.readUInt32LE(respos + 4, respos + 8);
				res.fileName = key.fileName + '.' + key.res_type;
				res.leaf = true;
				res.extractionType = 'erf';
				res.erfFileName = fileName;
				//keys[key.filename + '.' + key.res_type] = res;
				keys.push(res);
			}
			return keys;
		}
	}
}
</script>

<style>

body{
	margin: 0;
}
h1{
	top: 15px;
	position: absolute;
	margin: 0;
	right: 20px;
	text-align: center;
	font-family: "Helvetica Neue",Helvetica;
	font-weight: 100;
	color:white;
}

.el-tree{
	width: calc(100% - 100px);
	height: 100%;
}

.el-header{
	background-color: #333333;
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
    /* content: '+'; */
    display: block;
    transition: all 0.25s;
    font-family: monospace;
}

/* .TreeViewDemo li.category.async>.item>.opener::after {
    content: '!';
} */

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
