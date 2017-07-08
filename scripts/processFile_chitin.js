const {dialog} = require('electron').remote
function openFile() {
	console.log('here');
	dialog.showOpenDialog({ properties: ['openDirectory'] }, function (fileNames) {
		console.log(fileNames);

		let directory = fileNames[0];
		fs.readdir(directory, function (err, data) {
			if (err) return console.log(err)
				console.log(data);

			let key = data.find(function (row) {
				return row === 'chitin.key';
			})

			console.log(key);
			if (!key) {
				console.log('invalid directory');
				return false;
			}
			else {
				console.log('valid directory');
				let game = data.find(function (row) {
					return row === 'chitin.key';
				})
				if (game === 'swkotor2.ini') {
					tslPath = directory;
				}
				else {
					k1Path = directory;
				}
				parseChitinKey(directory);
			}
		})
	})
}


let chitinHeader = {
number_of_bif_files: '',
number_of_entries_in_chitin_key: '',
offset_to_table_of_files: '',
offset_to_table_of_keys: '',
build_year: '',
build_day: '',
header_length: 60
}
let files = []

function parseChitinKey (directory) {
fs.open(directory + '/chitin.key', 'r', function postOpen (errOpen, fd) {
readChitinHeader(fd)
// console.log(chitinHeader)
// parseFilesInChitin(fd)
// console.log(files)
// console.log(chitinHeader)
// fs.read(fd, new Buffer(12), 0, 12, chitinHeader.offset_to_table_of_keys, function readFirstTableEntry (errRead, bytesRead, buffer) {
//   // console.log('buffer length', buffer.length)
//   // console.log(buffer.toString())
// })
// fs.read(fd, new Buffer(300), 0, 300, 18439, function readFilename (errRead, bytesRead, buffer) {
//   // console.log('buffer length', buffer.length)
//   console.log('bif filename', buffer.toString('utf8', 196, 196 + 13))
//   // console.log(buffer.toString())
// })
})
}

function readChitinHeader (fd) {
fs.read(fd, new Buffer(chitinHeader.header_length), 0, chitinHeader.header_length, 0, function readKeyHeader (errRead, bytesRead, buffer) {
chitinHeader.number_of_bif_files = buffer.readUInt32LE(8)
chitinHeader.number_of_entries_in_chitin_key = buffer.readUInt32LE(12)
chitinHeader.offset_to_table_of_files = buffer.readUInt32LE(16)
chitinHeader.offset_to_table_of_keys = buffer.readUInt32LE(20)
chitinHeader.build_year = buffer.readUInt32LE(24)
chitinHeader.build_day = buffer.readUInt32LE(28)
// var promise =
parseFilesInChitin(fd)
// promise.getFilenames()
})
}

function parseFilesInChitin (fd) {
console.log('parseFiles', chitinHeader.number_of_entries_in_chitin_key)
console.log(chitinHeader)
var counter = 0
for (let i = 0; i < chitinHeader.number_of_entries_in_chitin_key; i++) {
fs.read(fd, new Buffer(12), 0, 12, chitinHeader.offset_to_table_of_files + (i * 12), function readFilename (errRead, bytesRead, buffer) {
  files.push({
	size_of_file: buffer.readUInt32LE(0),
	offset_into_filename_table_for_filename: buffer.readUInt32LE(4),
	length_of_filename: buffer.readUInt16LE(8),
	bif_drive: buffer.readUInt16LE(10)
  })
  counter++
  console.log(counter)
})
}
// let getFilenames = function () {
//   console.log('getFilenames')
//   for (let i = 0; i < chitinHeader.number_of_entries_in_chitin_key; i++) {
//     fs.read(
//       fd,
//       new Buffer(files[i].length_of_filename),
//       0,
//       files[i].length_of_filename,
//       files[i].offset_into_filename_table_for_filename,
//       function readFilename (errRead, bytesRead, buffer) {
//         files[i].filename = buffer.toString()
//       }
//     )
//   }
// }

// console.log(files)
// var result = (function () {
//   console.log('began')
//   while (counter < chitinHeader.number_of_entries_in_chitin_key) {
//     console.log(counter)
//     continue
//   }
//   console.log('finished')
//   return {getFilenames: getFilenames}
// })()
// return result
}
