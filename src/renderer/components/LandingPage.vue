<template>
	<el-container>
		<el-header>
			<el-button @click="goToPaths()" type="primary">Paths</el-button>
			<h1>
				Revan Editor
			</h1>
		</el-header>

		<el-tree :data="bifFiles" ref="fileTree" expand-on-click-node lazy :load="loadNode1" :props="treeProps" :empty-text="emptyText"></el-tree>

		<el-aside>
			<el-button @click="extractBif()" type="primary">Export</el-button>
		</el-aside>
	</el-container>
</template>

<script>

const electron = require('electron')
const fs = require('fs');

const dialog = electron.remote.dialog;
const app = electron.remote.app;
import path from 'path'
const _ = require('lodash');


export default {
	name: 'landing-page',
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
			kotor.files.push( {fileName:'BIFs', leaf: false, files: me.parseChitinKey(me.kotorPath, 'KotOR') });
		}
		if(me.tslPath){
			me.currentGame = "tsl";
			tsl.files.push( {fileName:'BIFs', leaf: false, files: me.parseChitinKey(me.tslPath, 'TSL') });
		}

		me.currentGame = "";

		bifFiles.push(kotor);
		bifFiles.push(tsl);

		me.bifFiles = bifFiles;
	},

	data:function(){
		return {
			emptyText: "Please open a key",
			filePath: "",
			kotorPath: "",
			tslPath: "",
			currentGame: "",
			treeProps: {
				children: 'files',
				label: 'fileName',
				isLeaf: 'leaf'
			},
			bifFiles: [],
			fileExtensionLookup: {
				'0':    'res',
				'1':    'bmp',
				'3':    'tga',
				'4':    'wav',
				'6':    'plt',
				'7':    'ini',
				'8':    'mp3',
				'9':    'mpg',
				'10':   'txt',
				'11':   'wma',
				'12':   'wmv',
				'13':   'xmv',
				'2000': 'plh',
				'2001': 'tex',
				'2002': 'mdl',
				'2003': 'thg',
				'2005': 'fnt',
				'2007': 'lua',
				'2008': 'slt',
				'2009': 'nss',
				'2010': 'ncs',
				'2011': 'mod',
				'2012': 'are',
				'2013': 'set',
				'2014': 'ifo',
				'2015': 'bic',
				'2016': 'wok',
				'2017': '2da',
				'2018': 'tlk',
				'2022': 'txi',
				'2023': 'git',
				'2024': 'bti',
				'2025': 'uti',
				'2026': 'btc',
				'2027': 'utc',
				'2029': 'dlg',
				'2030': 'itp',
				'2031': 'btt',
				'2032': 'utt',
				'2033': 'dds',
				'2034': 'bts',
				'2035': 'uts',
				'2036': 'ltr',
				'2037': 'gff',
				'2038': 'fac',
				'2039': 'bte',
				'2040': 'ute',
				'2041': 'btd',
				'2042': 'utd',
				'2043': 'btp',
				'2044': 'utp',
				'2045': 'dft',
				'2046': 'gic',
				'2047': 'gui',
				'2048': 'css',
				'2049': 'ccs',
				'2050': 'btm',
				'2051': 'utm',
				'2052': 'dwk',
				'2053': 'pwk',
				'2054': 'btg',
				'2055': 'utg',
				'2056': 'jrl',
				'2057': 'sav',
				'2058': 'utw',
				'2059': '4pc',
				'2060': 'ssf',
				'2061': 'hak',
				'2062': 'nwm',
				'2063': 'bik',
				'2064': 'ndb',
				'2065': 'ptm',
				'2066': 'ptt',
				'3000': 'lyt',
				'3001': 'vis',
				'3002': 'rim',
				'3003': 'pth',
				'3004': 'lip',
				'3005': 'bwm',
				'3006': 'txb',
				'3007': 'tpc',
				'3008': 'mdx',
				'3009': 'rsv',
				'3010': 'sig',
				'3011': 'xbx',
				'9997': 'erf',
				'9998': 'bif',
				'9999': 'key'
			}
		};
	},
	methods: {
		goToPaths(){
			this.$router.push('GameSelection');
		},

		extractBif(){
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

			fs.open(path + "/" + me.bifFiles[index].files[0].files[file.bifIndex].bif_filename.trim().replace(/\\/g,"/").replace(/\0/g, ''), 'r', function(err, fd){
				if(err){
					throw new Error(err);
				}

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

				dialog.showSaveDialog({defaultPath: file.fileName.trim().replace(/\0/g, '') },function(fileNames){
					if(!fileNames){
						return false;
					}
					fs.writeFileSync(fileNames, buffer);
				})

			});
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
				bif.fileName = fileName.replace("data\\", '');

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

				file.fileExtension = fileExtensionLookup[file.file_extension_code];
				file.fileName = file.resref + "." + file.fileExtension;

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

					var files = [];
					for(var key in sorted ){
						files.push({files: sorted[key], fileName: key});
					}

					ele.files = files;
				}

			})

			return bifFiles;
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
</style>
