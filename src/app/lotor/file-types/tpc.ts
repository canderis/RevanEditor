/*
 * @author ndixUR / https://github.com/ndixUR/
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from 'three';
import * as dxt from 'decode-dxt';
// const dxt = require('decode-dxt');

interface TPCTexture extends THREE.Texture {
	pixelDepth?: number;
	extensionString?: string;
}

export const TPCLoader = function(manager = undefined) {
	this.manager =
		manager !== undefined ? manager : THREE.DefaultLoadingManager;
};

function toArrayBuffer(buf: Buffer) {
	const ab = new ArrayBuffer(buf.length);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

TPCLoader.prototype.load = function(buffer: Buffer, onLoad, onError) {
	const scope = this;

	const texture: TPCTexture = new THREE.Texture();

	// let loader = new THREE.FileLoader(this.manager);
	// loader.setResponseType('arraybuffer');

	// loader.load(
	// 	url,
	// function(buffer) {
	try {
		texture.image = scope.parse(toArrayBuffer(buffer));
	} catch (err) {
		if (onError) {
			onError(err);
		}
		return;
	}
	if (
		texture.image &&
		texture.image.hasAttribute &&
		texture.image.hasAttribute('pixelDepth')
	) {
		texture.pixelDepth = parseInt(
			texture.image.getAttribute('pixelDepth'),
			10
		);
		texture.image.removeAttribute('pixelDepth');
	}
	// console.log(texture.image);
	if (
		texture.image &&
		texture.image.hasAttribute &&
		texture.image.hasAttribute('txiValue')
	) {
		texture.extensionString = texture.image.getAttribute('txiValue');
		texture.image.removeAttribute('txiValue');
	}
	// texture.sourceFile = url;
	texture.needsUpdate = true;

	if (onLoad !== undefined) {
		onLoad(texture);
	}
	// },
	// onProgress,
	// onError
	// );

	return texture;
};

// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js
TPCLoader.prototype.parse = function(buffer) {
	// TPC Constants
	const TPC_TYPE_NO_MIP = 0,
		TPC_TYPE_GREY = 1,
		TPC_TYPE_RGB = 2,
		TPC_TYPE_RGBA = 4,
		TPC_TYPE_BGRA = 12;

	if (buffer.length < 128) {
		console.error(
			'THREE.TPCLoader.parse: Not enough data to contain header.'
		);
	}

	const real_size = buffer.length - 128;
	const view = new DataView(buffer);

	let content = new Uint8Array(buffer),
		offset = 0,
		header = {
			frame_pixels: view.getUint32(0, true),
			alpha_blending: view.getFloat32(4, true),
			width: view.getUint16(8, true),
			height: view.getUint16(10, true),
			image_type: content[11],
			mipmap_count: content[12],
			compressed: false,
			frame_count: 1,
			txi_offset: 0,
			frame_width: null,
			frame_height: null,
			pixel_size: null,
			txi_value: null
		};
	header.frame_width = header.width;
	header.frame_height = header.height;
	console.log(header);
	console.log(offset);
	// skip header with much reserved padding
	offset = 128;

	// Get number of pixels for an image of width x height plus all mipmaps
	function pixelsForMipmaps(width, height, min_block) {
		// console.log(`pixelsForMipmaps ${width} ${height} ${min_block}`);
		console.log(header);
		let num_pix = 0;
		min_block = min_block || 0;
		do {
			num_pix += Math.max(width * height, min_block);
			// console.log(`pixelsForMipmaps ${width} ${height} ${num_pix}`);
			width = Math.floor(width / 2);
			height = Math.floor(height / 2);
			if (!header.mipmap_count) {
				console.log('no mipmap mode');
				width = 0;
				height = 0;
			}
		} while (width && height);
		// console.log(` == ${num_pix}`);
		return num_pix;
	}

	// ArrayBuffer to String
	function abuf2str(buf) {
		return String.fromCodePoint.apply(null, new Uint8Array(buf));
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}

	// Read TXI value from buffer by reading from end forward, testing for ASCII
	function txiReadPredictive(header, buffer) {
		// console.log(header.txi_offset);
		// console.log(buffer.slice(header.txi_offset));
		console.log(buffer.byteLength);
		let nonascii = false;
		// let ascii_test = /^[ -~\t\n\r]+$/mi;
		let txi_offset = buffer.byteLength - 1;
		while (!nonascii && txi_offset) {
			// console.log(buffer.slice(txi_offset));
			const test_str = abuf2str(buffer.slice(txi_offset));
			// console.log(test_str);
			// console.log(test_str.length);
			// console.log(test_str.charCodeAt(0));
			// non-printing, non-ascii characters, match any
			const ascii_test = /[^ -~\t\n\r]+/im;
			// console.log(ascii_test.test(test_str));
			if (ascii_test.test(test_str)) {
				nonascii = true;
			} else {
				header.txi_value = test_str;
				header.txi_offset = txi_offset;
				txi_offset -= 1;
			}
		}
		console.log(
			`predictive result: offset: ${header.txi_offset} value: ${header.txi_value}`
		);
	}

	// Read TXI value from buffer by reading from known offset to EOF
	function txiRead(header, buffer) {
		console.log(header.txi_offset);
		console.log(buffer.slice(header.txi_offset));
		console.log(buffer.byteLength);
		if (header.txi_offset && header.txi_offset < buffer.byteLength) {
			header.txi_value = abuf2str(buffer.slice(header.txi_offset));
			// non-printing, non-ascii characters, match any
			const ascii_test = /[^ -~\t\n\r]+/im;
			if (ascii_test.test(header.txi_value)) {
				// invalid TXI, should not really happen, but does.
				console.log(
					'deleted invalid TXI data: ' +
						header.txi_value.length +
						' bytes'
				);
				delete header.txi_value;
			}
		}
	}

	function tpcCheckHeader(header) {
		switch (header.image_type) {
			// What the need of a file without data ?
			case TPC_TYPE_NO_MIP:
				// console.error( 'THREE.TPCLoader.parse.tpcCheckHeader: No data' );
				header.pixel_size = 24;
				header.pixel_bytes = 3;
				break;
			case TPC_TYPE_GREY:
				header.pixel_size = 8;
				header.pixel_bytes = 1;
				break;
			case TPC_TYPE_RGB:
				header.pixel_size = 24;
				header.pixel_bytes = 3;
				break;
			case TPC_TYPE_RGBA:
				header.pixel_size = 32;
				header.pixel_bytes = 4;
				break;
			case TPC_TYPE_BGRA:
				header.pixel_size = 32;
				header.pixel_bytes = 4;
				break;

			// Invalid type ?
			default:
				console.error(
					'THREE.TPCLoader.parse.tpcCheckHeader: Invalid type "' +
						header.image_type +
						'"'
				);
		}

		// Check image width and height
		if (header.width <= 0 || header.height <= 0) {
			console.error(
				'THREE.TPCLoader.parse.tpcCheckHeader: Invalid image size'
			);
		}

		const expected_mipmaps = Math.log(header.width) / Math.log(2);

		if (header.frame_pixels === 0) {
			// uncompressed data
			header.compressed = false;

			// compute number of pixels
			let mw = header.width,
				mh = header.height;
			header.data_size = 0;
			header.mipmap_count = 0;
			do {
				header.data_size += mw * mh;
				mw = Math.floor(mw / 2);
				mh = Math.floor(mh / 2);
				header.mipmap_count += 1;
			} while (mw && mh);
			// header.data_size = (((header.width * header.height) * 2) - 1);
			// console.log(header.image_type);
			// console.log(TPC_TYPE_RGB);
			// header.data_size *= header.pixel_size >> 3;
			let image_data_size = content.length - offset;
			if (header.width < 8 && header.height < 8) {
				// finding TXI & data-fitting, especially mipmaps vs no mipmaps,
				// become very ambiguous at small sizes,
				// so, for very small textures, we read ascii chars from the end
				// of the file to get TXI length & offset, then use that in our
				// data fit process
				// XXX predictive is a misnomer here
				txiReadPredictive(header, buffer);
				if (header.txi_value && header.txi_value.length) {
					image_data_size -= header.txi_value.length;
				}
			}
			// pixel size/image type are garbage, fit data to determine pixel format
			for (const test_bytes of [4, 3, 1]) {
				console.log(
					test_bytes,
					content.length,
					offset + header.data_size * test_bytes
				);
				if (
					image_data_size >= header.data_size * test_bytes || // header.image_type == TPC_TYPE_NO_MIP &&
					image_data_size >= header.width * header.height * test_bytes
				) {
					console.log('found actual bytes = ' + test_bytes);
					// this is the actual bitness
					switch (test_bytes) {
						case 4:
							// 32-bit
							header.pixel_size = 32;
							header.pixel_bytes = 4;
							header.image_type = TPC_TYPE_RGBA;
							break;
						case 3:
							// 24-bit
							header.pixel_size = 24;
							header.pixel_bytes = 3;
							header.image_type = TPC_TYPE_RGB;
							break;
						case 1:
							// 8-bit
							header.pixel_size = 8;
							header.pixel_bytes = 1;
							header.image_type = TPC_TYPE_GREY;
							break;
					}
					if (
						header.image_type === TPC_TYPE_NO_MIP ||
						image_data_size <= header.data_size * test_bytes
					) {
						header.image_type = TPC_TYPE_NO_MIP;
						header.mipmap_count = 0;
						header.data_size = header.width * header.height;
					}
					break;
				}
			}
			// header.data_size *= header.pixel_size >> 3;
			header.data_size *= header.pixel_bytes;

			// read TXI file
			if (!header.txi_offset) {
				header.txi_offset = offset + header.data_size;
				if (header.txi_offset < content.length) {
					txiRead(header, buffer);
					// console.log(header);
					// normal maps are BGRA
					if (
						header.txi_value &&
						header.txi_value.length &&
						header.txi_value.match(/^\s*isbumpmap\s+1/im)
					) {
						// console.log('bumpmap detected');
						// header.image_type = TPC_TYPE_BGRA;
					}
				}
			}
		} else {
			// DXT compressed data
			header.compressed = true;

			// special cases
			if (header.width * header.height === header.frame_pixels) {
				// single frame
			} else if (
				header.width * header.width === header.frame_pixels &&
				header.height > header.width
			) {
				// cubemap?
				header.frame_count =
					parseInt(header.height, 10) / parseInt(header.width, 10);
				header.numX = 1;
				header.numY = 6;
				header.frame_height = header.frame_width;
			} else if (
				header.width * header.height >= header.frame_pixels &&
				header.mipmap_count < expected_mipmaps
			) {
				console.log('ANIMATED PROCESSING');
				// animated texture, priority is reading the TXI so you know the layout
				header.txi_offset = offset + header.frame_pixels;
				txiRead(header, buffer);
				if (header.txi_value) {
					let matches;
					if (
						(matches = header.txi_value.match(/^\s*numx\s+(\d+)/im))
					) {
						header.numX = parseInt(matches[1]);
					} else if (
						(matches = header.txi_value.match(
							/^\s*defaultwidth\s+(\d+)/im
						))
					) {
						header.numX = header.width / parseInt(matches[1]);
					}
					if (
						(matches = header.txi_value.match(/^\s*numy\s+(\d+)/im))
					) {
						header.numY = parseInt(matches[1]);
					} else if (
						(matches = header.txi_value.match(
							/^\s*defaultheight\s+(\d+)/im
						))
					) {
						header.numY = header.height / parseInt(matches[1]);
					}
					if (header.numX && header.numY) {
						header.frame_width = header.width / header.numX;
						header.frame_height = header.height / header.numY;
						header.frame_count = header.numX * header.numY;
					} else {
						console.log('NOT ANIMATED');
						// speculative txi read likely failed, let it be attempted later
						delete header.txi_offset;
						delete header.txi_value;
					}
				} else {
					console.log('NOT ANIMATED');
					header.txi_offset = 0;
				}
			}

			if (header.image_type === TPC_TYPE_NO_MIP) {
				// image_type == 0 is maybe sometimes associated with textures that
				// have no mipmaps, if anything ... image_type is very unreliable
				header.mipmap_count = 0;
			}

			// fit data to determine image_type,
			// recorded image type number is routinely garbage
			let test_size = 0;
			test_size =
				pixelsForMipmaps(header.frame_width, header.frame_height, 16) *
				header.frame_count *
				1;
			console.log(`dxt5 ${test_size} ${header.frame_pixels}`);
			if (
				test_size === header.frame_pixels - offset ||
				test_size === header.frame_pixels ||
				header.frame_pixels === header.width * header.height ||
				content.length >= test_size + offset
			) {
				console.log('FIT RGBA/DXT5');
				header.image_type = TPC_TYPE_RGBA;
				header.mipmap_count = 1;
			} else if (
				test_size * 0.5 === header.frame_pixels - offset ||
				test_size * 0.5 === header.frame_pixels ||
				header.frame_pixels === header.width * header.height * 0.5 ||
				content.length >= test_size * 0.5 + offset
			) {
				console.log('FIT RGB/DXT1');
				header.image_type = TPC_TYPE_RGB;
				header.mipmap_count = 1;
			}
			/*
		test_size = pixelsForMipmaps(
		  //header.frame_width, header.frame_height, 8
		  header.frame_width, header.frame_height, 16
		) * header.frame_count * 0.5;
		console.log(`dxt1 ${test_size} ${header.frame_pixels}`);
		if (test_size === header.frame_pixels - offset ||
			test_size === header.frame_pixels ||
			header.frame_pixels === header.width * header.height * 0.5 ||
			content.length >= test_size + offset) {
		  console.log('FIT RGB/DXT1');
		  header.image_type = TPC_TYPE_RGB;
		  header.mipmap_count = 1;
		}
		*/

			// set some info about bit-depth and sizes
			header.min_block = 0;
			switch (header.image_type) {
				case TPC_TYPE_GREY:
				// not convinced this exists...
				case TPC_TYPE_RGB:
					header.pixel_size = 24;
					header.pixel_bytes = 0.5;
					// XXX we have to set min_block to 16 here instead of 8,
					// it is basically working around a bug in how we are
					// gettting the number of 'pixels' via pixelsForMipmaps,
					// the issue is that the DXT numbers include the bit-depth,
					// but the uncompressed numbers do not, it happens to work
					// for DXT5 because pixel_bytes == 1,
					// for DXT1 pixel_bytes == 0.5,
					// so we are doubling the minimum blocksize until we fix it
					// header.min_block = 8;
					header.min_block = 16;
					break;
				case TPC_TYPE_RGBA:
					header.pixel_size = 32;
					header.pixel_bytes = 1;
					header.min_block = 16;
					break;
			}
			header.data_size = pixelsForMipmaps(
				header.frame_width,
				header.frame_height,
				header.min_block
			);
			header.data_size *= header.frame_count;
			header.data_size *= header.pixel_bytes;
			console.log(
				`DATA SIZE ${header.data_size} ${header.width} ${header.height}`
			);

			// read TXI if it did not happen yet
			if (!header.txi_value) {
				header.txi_offset = offset + header.data_size;
				txiRead(header, buffer);
			}
		}
		// console.log(header);
	}

	// Check TPC if it is valid format
	tpcCheckHeader(header);

	if (offset >= content.length) {
		console.error('THREE.TPCLoader.parse: No data');
	}

	// Skip the needn't data
	// offset += header.id_length;

	const use_dxt = header.compressed;

	// Parse TPC image buffer
	function tpcParse(use_dxt, header, offset, data) {
		let pixel_data, pixel_size, frame_size, total_size;

		// pixel_size = header.pixel_size >> 3;
		pixel_size = header.pixel_bytes;
		frame_size = header.frame_width * header.frame_height * pixel_size;
		total_size = frame_size * header.frame_count;
		if (header.compressed) {
			// total_size = header.data_size;
			console.log(`pixel total ${total_size}`);
			console.log(`frame pix ${header.frame_pixels}`);
		}

		console.log('raw');
		console.log(offset);
		// RAW Pixels
		// slice makes a copy, not what I want, but this actually works...
		let pd_offset = 0;
		offset = 128;
		pixel_data = new Uint8Array(total_size);
		console.log('created pixel_data with total_size ' + total_size);
		for (let i = 0; i < header.frame_count; i++) {
			// pixel_data.set(data.slice(offset, offset += frame_size), pd_offset);
			const temp =
				pixelsForMipmaps(
					header.frame_width / 2,
					header.frame_height / 2,
					header.min_block
				) * header.pixel_bytes;
			console.log(
				`set pixel data @${pd_offset} w/ original range ${offset}-${offset +
					frame_size}, skip ${temp} to ${offset + frame_size + temp}`
			);
			pixel_data.set(
				data.subarray(offset, (offset += frame_size)),
				pd_offset
			);
			pd_offset += frame_size;
			offset +=
				pixelsForMipmaps(
					header.frame_width / 2,
					header.frame_height / 2,
					header.min_block
				) * header.pixel_bytes;
		}
		console.log(offset);
		console.log(pixel_data);

		return {
			pixel_data: pixel_data
			// palettes: palettes
		};
	}

	function tpcGetImageData8bits(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		image,
		palettes
	) {
		const colormap = palettes;
		let color,
			i = 0,
			x,
			y;
		const width = header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i++) {
				color = image[i];
				imageData[(x + width * y) * 4 + 3] = 255;
				imageData[(x + width * y) * 4 + 2] = colormap[color * 3 + 0];
				imageData[(x + width * y) * 4 + 1] = colormap[color * 3 + 1];
				imageData[(x + width * y) * 4 + 0] = colormap[color * 3 + 2];
			}
		}

		return imageData;
	}

	function tpcGetImageData16bits(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		image
	) {
		let color,
			i = 0,
			x,
			y;
		const width = header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 2) {
				color = image[i + 0] + (image[i + 1] << 8); // Inversed ?
				imageData[(x + width * y) * 4 + 0] = (color & 0x7c00) >> 7;
				imageData[(x + width * y) * 4 + 1] = (color & 0x03e0) >> 2;
				imageData[(x + width * y) * 4 + 2] = (color & 0x001f) >> 3;
				imageData[(x + width * y) * 4 + 3] = color & 0x8000 ? 0 : 255;
			}
		}

		return imageData;
	}

	function tpcGetImageData24bits(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		image
	) {
		let i = 0,
			x,
			y;
		const width = header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 3) {
				imageData[(x + width * y) * 4 + 3] = 255;
				imageData[(x + width * y) * 4 + 0] = image[i + 0];
				imageData[(x + width * y) * 4 + 1] = image[i + 1];
				imageData[(x + width * y) * 4 + 2] = image[i + 2];
			}
		}

		return imageData;
	}

	function tpcGetImageData32bitsSwizzle(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		image
	) {
		let i = 0,
			x,
			y;
		const width = header.frame_width;

		console.log('read 32 bit ', y_start, y_end, x_start, x_end);
		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 4) {
				imageData[(x + width * y) * 4 + 2] = image[i + 0];
				imageData[(x + width * y) * 4 + 1] = image[i + 1];
				imageData[(x + width * y) * 4 + 0] = image[i + 2];
				imageData[(x + width * y) * 4 + 3] = image[i + 3];
			}
		}

		return imageData;
	}

	function tpcGetImageData32bits(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		image
	) {
		let i = 0,
			x,
			y;
		const width = header.frame_width;

		console.log('read 32 bit ', y_start, y_end, x_start, x_end);
		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 4) {
				imageData[(x + width * y) * 4 + 0] = image[i + 0];
				imageData[(x + width * y) * 4 + 1] = image[i + 1];
				imageData[(x + width * y) * 4 + 2] = image[i + 2];
				imageData[(x + width * y) * 4 + 3] = image[i + 3];
			}
		}

		return imageData;
	}

	function tpcGetImageDataDXT24bits(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		img
	) {
		/*
	  console.log(img.byteOffset);
	  console.log(img.byteLength);
	  console.log(img.buffer.byteLength);
	  */
		console.log(img);
		const image = dxt(
			new DataView(img.buffer, img.byteOffset, img.byteLength),
			header.frame_width,
			header.frame_height,
			dxt.dxt1
		);
		console.log(image);

		let i = 0,
			x,
			y;
		const width = header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 4) {
				imageData[(x + width * y) * 4 + 0] = image[i + 0];
				imageData[(x + width * y) * 4 + 1] = image[i + 1];
				imageData[(x + width * y) * 4 + 2] = image[i + 2];
				imageData[(x + width * y) * 4 + 3] = image[i + 3];
			}
		}

		return imageData;
	}

	function tpcGetImageDataDXT32bits(
		imageData,
		y_start,
		y_step,
		y_end,
		x_start,
		x_step,
		x_end,
		img
	) {
		const dxt = require('decode-dxt');

		console.log(img);
		const image = dxt(
			new DataView(img.buffer, img.byteOffset, img.byteLength),
			header.frame_width,
			header.frame_height,
			dxt.dxt5
		);
		console.log(image);

		let i = 0,
			x,
			y;
		const width = header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 4) {
				imageData[(x + width * y) * 4 + 0] = image[i + 0];
				imageData[(x + width * y) * 4 + 1] = image[i + 1];
				imageData[(x + width * y) * 4 + 2] = image[i + 2];
				imageData[(x + width * y) * 4 + 3] = image[i + 3];
			}
		}

		return imageData;
	}

	function getTpcRGBA(data, width, height, image, header) {
		let x_start, y_start, x_step, y_step, x_end, y_end;

		// this is frame_size total w/ mipmap data, but that is already pruned from image
		// const frame_size = header.data_size / header.frame_count;
		const frame_size =
			header.frame_width * header.frame_height * header.pixel_bytes;

		for (
			let frame_number = 0;
			frame_number < header.frame_count;
			frame_number++
		) {
			// for (let frame_number = 1; frame_number < Math.min(header.frame_count, 2); frame_number++) {
			// give image data methods frame width/height, but pixel ranges for their image, envelope of image data appropriate
			let frame_rows = 0;
			let frame_cols = 0;
			if (frame_number >= header.numX) {
				frame_rows = frame_number / parseInt(header.numX, 10);
			}
			if (frame_number - frame_rows * header.numX >= 0) {
				frame_cols = frame_number - frame_rows * header.numX;
			}
			const pixel_data_offset = frame_number * frame_size;
			// BL - opengl-friendly
			// x_start = 0;
			x_start = frame_cols * header.frame_width;
			x_step = 1;
			// x_end = width;
			x_end = x_start + header.frame_width;
			// y_start = height - 1;
			y_start = (frame_rows + 1) * header.frame_height - 1;
			y_step = -1;
			// y_end = - 1;
			y_end = frame_rows * header.frame_height - 1;

			console.log(
				`frame ${frame_number}: x ${x_start}-${x_end} y ${y_start}-${y_end} ` +
					`data ${pixel_data_offset}-${pixel_data_offset +
						frame_size}`
			);

			const frame_pixels = image.subarray(
				pixel_data_offset,
				pixel_data_offset + frame_size + 1
			);

			if (use_dxt) {
				switch (header.pixel_size) {
					case 24:
						tpcGetImageDataDXT24bits(
							data,
							y_start,
							y_step,
							y_end,
							x_start,
							x_step,
							x_end,
							frame_pixels
							// image.subarray(pixel_data_offset, pixel_data_offset + frame_size + 1)
						);
						break;
					case 32:
						tpcGetImageDataDXT32bits(
							data,
							y_start,
							y_step,
							y_end,
							x_start,
							x_step,
							x_end,
							frame_pixels
							// image.subarray(pixel_data_offset, pixel_data_offset + frame_size + 1)
						);
						break;
					default:
						console.error(
							'THREE.TPCLoader.parse.getTpcRGBA: not support this format'
						);
						break;
				}
			} else {
				switch (header.pixel_size) {
					case 8:
						tpcGetImageData8bits(
							data,
							y_start,
							y_step,
							y_end,
							x_start,
							x_step,
							x_end,
							frame_pixels,
							frame_pixels
						);
						break;

					case 16:
						tpcGetImageData16bits(
							data,
							y_start,
							y_step,
							y_end,
							x_start,
							x_step,
							x_end,
							frame_pixels
						);
						break;

					case 24:
						tpcGetImageData24bits(
							data,
							y_start,
							y_step,
							y_end,
							x_start,
							x_step,
							x_end,
							frame_pixels
						);
						break;

					case 32:
						if (header.image_type === TPC_TYPE_BGRA) {
							tpcGetImageData32bitsSwizzle(
								data,
								y_start,
								y_step,
								y_end,
								x_start,
								x_step,
								x_end,
								frame_pixels
							);
						} else {
							tpcGetImageData32bits(
								data,
								y_start,
								y_step,
								y_end,
								x_start,
								x_step,
								x_end,
								frame_pixels
							);
						}
						break;

					default:
						console.error(
							'THREE.TPCLoader.parse.getTpcRGBA: not support this format'
						);
						break;
				}
			}
		}

		// Load image data according to specific method
		// var func = 'tpcGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
		// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
		return data;
	}

	/*
	 */
	const canvas = document.createElement('canvas');
	canvas.width = header.width;
	canvas.height = header.height;

	const context = canvas.getContext('2d');
	const imageData = context.createImageData(header.width, header.height);

	const result = tpcParse(use_dxt, header, offset, content);
	const rgbaData = getTpcRGBA(
		imageData.data,
		header.width,
		header.height,
		result.pixel_data,
		header
	);

	console.log('img data', imageData);
	context.putImageData(imageData, 0, 0);

	// tga2tpc CUSTOM:
	canvas.setAttribute('pixelDepth', header.pixel_size);
	if (header.txi_value && header.txi_value.length) {
		console.log('export txi_value');
		canvas.setAttribute('txiValue', header.txi_value);
		console.log(canvas.getAttribute('txiValue'));
	}

	return canvas;
};
