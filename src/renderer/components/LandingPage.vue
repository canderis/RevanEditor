<template>
  <div id="wrapper">
	<img id="logo" src="~@/assets/logo.png" alt="electron-vue">
	<main>
	  <div class="left-side">
		<span class="title">
		  Welcome to your new project!
		</span>
		<system-information></system-information>
	  </div>

	  <div class="right-side">
		<div class="doc">
		  <div class="title">Getting Started</div>
		  <p>
			electron-vue comes packed with detailed documentation that covers everything from
			internal configurations, using the project structure, building your application,
			and so much more.
		  </p>
		  <button @click="open('https://simulatedgreg.gitbooks.io/electron-vue/content/')">Read the Docs</button><br><br>
		</div>
		<div class="doc">
		  <div class="title alt">Other Documentation</div>
		  <button class="alt" @click="open('https://electron.atom.io/docs/')">Electron</button>
		  <button class="alt" @click="open('https://vuejs.org/v2/guide/')">Vue.js</button>
		  <button class="alt" @click="openFile()">Open Key</button>
		</div>
	  </div>
	</main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
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
	components: { SystemInformation },
	data:function(){
		return {
			bifFiles: [],
			filesInBifs: [],
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
		open (link) {
			this.$electron.shell.openExternal(link)
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


		// let chitinHeader = {
		// 	number_of_bif_files: '',
		// 	number_of_entries_in_chitin_key: '',
		// 	offset_to_table_of_files: '',
		// 	offset_to_table_of_keys: '',
		// 	build_year: '',
		// 	build_day: '',
		// 	header_length: 60
		// };

		parseChitinKey (directory) {
			var me = this;

			fs.openAsync(directory + '/chitin.key', 'r')
				.then(me.readChitinHeader)
				.then(me.parseBifFileDataInChitin)
				.then(me.parseTableOfKeys)
				//.then(arrangeBifFilesByTheAlphabet)
				.then(function(){
					console.log(me.bifFiles);
				});
		},

		//let chitinHeader;

		arrangeBifFilesByTheAlphabet(){
			me.bifFiles.forEach(function(bif){
				bif.files.forEach(function(file){
					//var firstChar = ;
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
			// let chitinHeader = {
			// 	number_of_bif_files: '',
			// 	number_of_entries_in_chitin_key: '',
			// 	offset_to_table_of_files: '',
			// 	offset_to_table_of_keys: '',
			// 	build_year: '',
			// 	build_day: '',
			// 	header_length: 60
			// };

			return fs.readAsync(fd, new Buffer(60), 0, 60, 0 )
				.then( function(args){
					var bytesRead = args[0];
					var buffer = args[1];

					//return {
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

				})

				//console.log(s);


			// fs.read(fd, new Buffer(chitinHeader.header_length), 0, chitinHeader.header_length, 0, function readKeyHeader (errRead, bytesRead, buffer) {
			// 	chitinHeader.number_of_bif_files = buffer.readUInt32LE(8)
			// 	chitinHeader.number_of_entries_in_chitin_key = buffer.readUInt32LE(12)
			// 	chitinHeader.offset_to_table_of_files = buffer.readUInt32LE(16)
			// 	chitinHeader.offset_to_table_of_keys = buffer.readUInt32LE(20)
			// 	chitinHeader.build_year = buffer.readUInt32LE(24)
			// 	chitinHeader.build_day = buffer.readUInt32LE(28)
			// 	return true;
			// })
			// .then( function(){
			// 		console.log('reading Promise');
			// 		parseBifFileDataInChitin(fd);
			// 		parseTableOfKeys(fd);
			// })
			// .then( function(){
			// 	console.log('Bif Files', bifFiles);
			// 	console.log('Chitin header', chitinHeader);
			// 	console.log('Bif File Items', filesInBifs);
			// });
		},

		parseBifFileDataInChitin (fd) {
			var me = this;
			var counter = 0
			for (let i = 0; i < me.chitinHeader.number_of_bif_files; i++) {
				fs.read(fd, new Buffer(12), 0, 12, me.chitinHeader.offset_to_table_of_files + (i * 12), function readFilename (errRead, bytesRead, buffer) {
					var bif = {
						size_of_file: buffer.readUInt32LE(0),
						offset_into_filename_table_for_filename: buffer.readUInt32LE(4),
						length_of_filename: buffer.readUInt16LE(8),
						bif_drive: buffer.readUInt16LE(10)
					};

					fs.read(fd, new Buffer(bif.length_of_filename), 0, bif.length_of_filename, bif.offset_into_filename_table_for_filename, function(error, bytes, buf) {
						bif.bif_filename = buf.toString();
					});
					counter++;

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
						uniqueId: buffer.readUInt32LE(18)
					};

					//var IntA =
					file.bifIndex = file.uniqueId >> 20
					file.indexOfFileInBif = file.uniqueId - (file.bifIndex << 20)


					file.fileExtension = me.fileExtensionLookup[file.file_extension_code];
					file.fileName = file.resref + "." + file.fileExtension;

					//if( file.uniqueId > 2097693 && file.uniqueId < 2097697) console.log(file);

					//filesInBifs.push(file);
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

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
	background:
	  radial-gradient(
		ellipse at top left,
		rgba(255, 255, 255, 1) 40%,
		rgba(229, 229, 229, .9) 100%
	  );
	height: 100vh;
	padding: 60px 80px;
	width: 100vw;
  }

  #logo {
	height: auto;
	margin-bottom: 20px;
	width: 420px;
  }

  main {
	display: flex;
	justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
	display: flex;
	flex-direction: column;
  }

  .welcome {
	color: #555;
	font-size: 23px;
	margin-bottom: 10px;
  }

  .title {
	color: #2c3e50;
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 6px;
  }

  .title.alt {
	font-size: 18px;
	margin-bottom: 10px;
  }

  .doc p {
	color: black;
	margin-bottom: 10px;
  }

  .doc button {
	font-size: .8em;
	cursor: pointer;
	outline: none;
	padding: 0.75em 2em;
	border-radius: 2em;
	display: inline-block;
	color: #fff;
	background-color: #4fc08d;
	transition: all 0.15s ease;
	box-sizing: border-box;
	border: 1px solid #4fc08d;
  }

  .doc button.alt {
	color: #42b983;
	background-color: transparent;
  }
</style>
