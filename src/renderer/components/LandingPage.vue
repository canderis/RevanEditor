<template>
	<div id="wrapper">
		<main>
			<el-button type="primary" @click="openFile()">Open Key</el-button>
			<el-button type="primary" @click="loadMyTree()">loadMyTree</el-button>

			<el-tree :data="fileTree" expand-on-click-node lazy :load="loadNode1" :props="treeProps" :empty-text="emptyText" @node-click="handleNodeClick"></el-tree>
		</main>
	</div>
</template>

<script>

const electron = require('electron')
const remote = electron.remote

const dialog = remote.dialog
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require('fs'),{
	filter: function(name) {
		return name !== "read";
	}
});
fs.readAsync = Promise.promisify(fs.read, {multiArgs: true });

export default {
	name: 'landing-page',
	data:function(){
		return {
			emptyText: "Please open a key",
			treeProps: {
	        	children: 'files',
	        	label: 'fileName',
				isLeaf: 'leaf'
	        },
			fileTree:[],
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
		handleNodeClick(data) {
	        console.log(data);
		},
		loadNode1(node, resolve) {
			console.log(node);
	        if (node.level === 0) {
	          return resolve(node.data);
	        }

	        if (node.level > 1) return resolve([]);


	        resolve(node.data.files);

		},
		openFile() {
			var me = this;

			dialog.showOpenDialog({ properties: ['openDirectory'] }, function (fileNames) {
				console.log(fileNames);

				if(fileNames.length < 1){
					return false;
				}
				let directory = fileNames[0];


				fs.readdir(directory, function (err, data) {
					if (err) return console.log(err)
						console.log(data);

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
						me.tslPath = directory;
					}
					else {
						me.k1Path = directory;
					}
					me.parseChitinKey(directory);
				})
			})
		},

		loadMyTree(){
			console.log('loadMyTree')
			this.fileTree = this.bifFiles;

		},


		parseChitinKey (directory) {
			var me = this;

			fs.openAsync(directory + '/chitin.key', 'r')
				.then(me.readChitinHeader)
				.then(me.parseBifFileDataInChitin)
				.then(me.parseTableOfKeys)
				.then(function(){
					console.log(me.bifFiles);
				});
		},


		arrangeBifFilesByTheAlphabet(){
			me.bifFiles.forEach(function(bif){
				bif.files.forEach(function(file){
					bif.sortedFiles[file.resRef.substr(0, 1)].push(file);
				});
				bif.sortedFiles.forEach(function(fileCategory){
					fileCategory.sort( function (a,b) {
						if (a.resRef < b.resRef)
							return -1;
						if (a.resRef > b.resRef)
							return 1;
						return 0;
					});
				});
			});

		},

		readChitinHeader (fd) {
			var me = this;

			return fs.readAsync(fd, new Buffer(60), 0, 60, 0 )
				.then( function(args){
					var bytesRead = args[0];
					var buffer = args[1];

					me.chitinHeader = {
						number_of_bif_files: buffer.readUInt32LE(8),
						number_of_entries_in_chitin_key: buffer.readUInt32LE(12),
						offset_to_table_of_files: buffer.readUInt32LE(16),
						offset_to_table_of_keys: buffer.readUInt32LE(20),
						build_year: buffer.readUInt32LE(24),
						build_day: buffer.readUInt32LE(28),
						header_length: 60
					};

					return fd;

				});
		},

		parseBifFileDataInChitin (fd) {
			var me = this;
			for (let i = 0; i < me.chitinHeader.number_of_bif_files; i++) {
				var bif = {};
				fs.read(fd, new Buffer(12), 0, 12, me.chitinHeader.offset_to_table_of_files + (i * 12), function readFilename (errRead, bytesRead, buffer) {
					var bif = {
						size_of_file: buffer.readUInt32LE(0),
						offset_into_filename_table_for_filename: buffer.readUInt32LE(4),
						length_of_filename: buffer.readUInt16LE(8),
						bif_drive: buffer.readUInt16LE(10),
					};

					fs.read(fd, new Buffer(bif.length_of_filename), 0, bif.length_of_filename, bif.offset_into_filename_table_for_filename, function(error, bytes, buf) {
						var fileName = buf.toString();
						bif.bif_filename = fileName;
						bif.fileName = fileName;
					});

					me.bifFiles.push(bif);
				});
			}
			return fd;
		},


		parseTableOfKeys(fd){
			var me = this;

			for (let i = 0; i < me.chitinHeader.number_of_entries_in_chitin_key; i++) {
				fs.read(fd, new Buffer(22), 0, 22, me.chitinHeader.offset_to_table_of_keys + (i * 22), function readFilename (errRead, bytesRead, buffer) {

					let file = {
						resref: buffer.toString('utf8', 0, 16),
						file_extension_code: buffer.readUInt16LE(16),
						uniqueId: buffer.readUInt32LE(18),
						leaf: false
					};

					file.bifIndex = file.uniqueId >> 20
					file.indexOfFileInBif = file.uniqueId - (file.bifIndex << 20)



					file.fileExtension = me.fileExtensionLookup[file.file_extension_code];
					file.fileName = file.resref + "." + file.fileExtension;

					if(!me.bifFiles[file.bifIndex]) console.log('Error File!!!', file);

					if(!me.bifFiles[file.bifIndex].files) me.bifFiles[file.bifIndex].files = [];

					me.bifFiles[file.bifIndex].files.push(file);

				});
			}

			return fd;
		}

	}
}
</script>

<style></style>
