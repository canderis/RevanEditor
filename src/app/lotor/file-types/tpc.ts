/*
 * @author ndixUR / https://github.com/ndixUR/
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from 'three';
// import * as dxt from 'decode-dxt';
const dxt = require('decode-dxt');

const TPC_TYPE_NO_MIP = 0;
const TPC_TYPE_GREY = 1;
const TPC_TYPE_RGB = 2;
const TPC_TYPE_RGBA = 4;
const TPC_TYPE_BGRA = 12;

export interface TPCTexture extends THREE.Texture {
	pixelDepth?: number;
	extensionString?: string;
}

interface TPCHeader {
	frame_pixels: number;
	alpha_blending: number;
	width: number;
	height: number;
	image_type: number;
	mipmap_count: number;
	compressed: boolean;
	frame_count: number;
	txi_offset: number;
	frame_width: number;
	frame_height: number;
	pixel_size: number;
	txi_value: string;
	pixel_bytes?: number;
	numX?: number;
	numY?: number;
	min_block?: number;
	data_size?: number;
}

export class TPCLoader {
	manager = THREE.DefaultLoadingManager;
	header: TPCHeader;
	use_dxt: boolean;

	constructor() {

		console.log(dxt);
	}

	static toArrayBuffer(buf: Buffer) {
		const ab = new ArrayBuffer(buf.length);
		const view = new Uint8Array(ab);
		for (let i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
		}

		return ab;
	}

	load(
		buffer: Buffer,
		onLoad: (texture: TPCTexture) => void,
		onError: (err: any) => void
	) {
		const texture: TPCTexture = new THREE.Texture();
		try {
			texture.image = this.parse(TPCLoader.toArrayBuffer(buffer));
		} catch (err ) {
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
	}

	parse(buffer: ArrayBuffer) {
		// TPC Constants


		if (buffer.byteLength < 128) {
			console.error(
				'THREE.TPCLoader.parse: Not enough data to contain header.'
			);
		}

		const view = new DataView(buffer);

		const content = new Uint8Array(buffer);

		this.header = {
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
		this.header.frame_width = this.header.width;
		this.header.frame_height = this.header.height;

		// skip header with much reserved padding
		const offset = 128;

		// Check TPC if it is valid format
		this.tpcCheckHeader(content, offset, buffer);

		if (offset >= content.length) {
			console.error('THREE.TPCLoader.parse: No data');
		}

		// Skip the needn't data
		// offset += header.id_length;

		this.use_dxt = this.header.compressed;





		/*
		 */
		const canvas = document.createElement('canvas');
		canvas.width = this.header.width;
		canvas.height = this.header.height;

		const context = canvas.getContext('2d');
		const imageData = context.createImageData(this.header.width, this.header.height);

		const result = this.tpcParse(content);
		const rgbaData = this.getTpcRGBA(
			imageData.data,
			result.pixel_data,
		);

		console.log('img data', imageData);
		context.putImageData(imageData, 0, 0);

		// tga2tpc CUSTOM:
		canvas.setAttribute('pixelDepth', `${this.header.pixel_size}`);
		if (this.header.txi_value && this.header.txi_value.length) {
			console.log('export txi_value');
			canvas.setAttribute('txiValue', this.header.txi_value);
			console.log(canvas.getAttribute('txiValue'));
		}

		return canvas;
	}

	tpcGetImageData8bits(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		image: Uint8Array,
		palettes: Uint8Array
	) {
		const colormap = palettes;
		let color;
		let i = 0;
		let x;
		let y;
		const width = this.header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i++) {
				color = image[i];
				imageData[(x + width * y) * 4 + 3] = 255;
				imageData[(x + width * y) * 4 + 2] =
					colormap[color * 3 + 0];
				imageData[(x + width * y) * 4 + 1] =
					colormap[color * 3 + 1];
				imageData[(x + width * y) * 4 + 0] =
					colormap[color * 3 + 2];
			}
		}

		return imageData;
	}

	tpcGetImageData16bits(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		image: Uint8Array
	) {
		let color;
		let i = 0;
		let x;
		let y;
		const width = this.header.width;

		for (y = y_start; y !== y_end; y += y_step) {
			for (x = x_start; x !== x_end; x += x_step, i += 2) {
				// tslint:disable-next-line: no-bitwise
				color = image[i + 0] + (image[i + 1] << 8); // Inversed ?
				// tslint:disable-next-line: no-bitwise
				imageData[(x + width * y) * 4 + 0] = (color & 0x7c00) >> 7;
				// tslint:disable-next-line: no-bitwise
				imageData[(x + width * y) * 4 + 1] = (color & 0x03e0) >> 2;
				// tslint:disable-next-line: no-bitwise
				imageData[(x + width * y) * 4 + 2] = (color & 0x001f) >> 3;
				imageData[(x + width * y) * 4 + 3] =
					// tslint:disable-next-line: no-bitwise
					color & 0x8000 ? 0 : 255;
			}
		}

		return imageData;
	}

	tpcGetImageData24bits(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		image: Uint8Array
	) {
		let i = 0;
		let x;
		let y;
		const width = this.header.width;

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

	tpcGetImageData32bitsSwizzle(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		image: Uint8Array
	) {
		let i = 0;
		let x;
		let y;
		const width = this.header.frame_width;

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

	tpcGetImageData32bits(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		image: Uint8Array
	) {
		let i = 0;
		let x;
		let y;
		const width = this.header.frame_width;

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

	tpcGetImageDataDXT24bits(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		img: Uint8Array
	) {
		const image = dxt(
			new DataView(img.buffer, img.byteOffset, img.byteLength),
			this.header.frame_width,
			this.header.frame_height,
			dxt.dxt1
		);


		let i = 0;
		let x;
		let y;
		const width = this.header.width;

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

	tpcGetImageDataDXT32bits(
		imageData: Uint8ClampedArray,
		y_start: number,
		y_step: number,
		y_end: number,
		x_start: number,
		x_step: number,
		x_end: number,
		img: Uint8Array
	) {
		const image = dxt(
			new DataView(img.buffer, img.byteOffset, img.byteLength),
			this.header.frame_width,
			this.header.frame_height,
			dxt.dxt5
		);

		let i = 0;
		let x;
		let y;
		const width = this.header.width;

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

	getTpcRGBA(data: Uint8ClampedArray, image: Uint8Array) {
		let x_start;
		let y_start;
		let x_step;
		let y_step;
		let x_end;
		let y_end;

		// this is frame_size total w/ mipmap data, but that is already pruned from image
		// const frame_size = header.data_size / header.frame_count;
		const frame_size =
			this.header.frame_width * this.header.frame_height * this.header.pixel_bytes;

		for (
			let frame_number = 0;
			frame_number < this.header.frame_count;
			frame_number++
		) {
			// for (let frame_number = 1; frame_number < Math.min(header.frame_count, 2); frame_number++) {
			// give image data methods frame width/height, but pixel ranges for their image, envelope of image data appropriate
			let frame_rows = 0;
			let frame_cols = 0;
			if (frame_number >= this.header.numX) {
				frame_rows = frame_number / this.header.numX;
			}
			if (frame_number - frame_rows * this.header.numX >= 0) {
				frame_cols = frame_number - frame_rows * this.header.numX;
			}
			const pixel_data_offset = frame_number * frame_size;
			// BL - opengl-friendly
			// x_start = 0;
			x_start = frame_cols * this.header.frame_width;
			x_step = 1;
			// x_end = width;
			x_end = x_start + this.header.frame_width;
			// y_start = height - 1;
			y_start = (frame_rows + 1) * this.header.frame_height - 1;
			y_step = -1;
			// y_end = - 1;
			y_end = frame_rows * this.header.frame_height - 1;

			console.log(
				`frame ${frame_number}: x ${x_start}-${x_end} y ${y_start}-${y_end} ` +
					`data ${pixel_data_offset}-${pixel_data_offset +
						frame_size}`
			);

			const frame_pixels = image.subarray(
				pixel_data_offset,
				pixel_data_offset + frame_size + 1
			);

			if (this.use_dxt) {
				switch (this.header.pixel_size) {
					case 24:
						this.tpcGetImageDataDXT24bits(
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
						this.tpcGetImageDataDXT32bits(
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
				switch (this.header.pixel_size) {
					case 8:
						this.tpcGetImageData8bits(
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
						this.tpcGetImageData16bits(
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
						this.tpcGetImageData24bits(
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
						if (this.header.image_type === TPC_TYPE_BGRA) {
							this.tpcGetImageData32bitsSwizzle(
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
							this.tpcGetImageData32bits(
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

	// Parse TPC image buffer
	tpcParse(data: Uint8Array) {
		let pixel_data;
		let pixel_size;
		let frame_size;
		let total_size;

		// pixel_size = header.pixel_size >> 3;
		pixel_size = this.header.pixel_bytes;
		frame_size = this.header.frame_width * this.header.frame_height * pixel_size;
		total_size = frame_size * this.header.frame_count;
		if (this.header.compressed) {
			// total_size = header.data_size;
			console.log(`pixel total ${total_size}`);
			console.log(`frame pix ${this.header.frame_pixels}`);
		}

		console.log('raw');
		// RAW Pixels
		// slice makes a copy, not what I want, but this actually works...
		let pd_offset = 0;
		let offset = 128;
		pixel_data = new Uint8Array(total_size);

		for (let i = 0; i < this.header.frame_count; i++) {
			// pixel_data.set(data.slice(offset, offset += frame_size), pd_offset);
			const temp =
				this.pixelsForMipmaps(
					this.header.frame_width / 2,
					this.header.frame_height / 2,
					this.header.min_block
				) * this.header.pixel_bytes;
			console.log(
				`set pixel data @${pd_offset} w/ original range ${offset}-${offset +
					frame_size}, skip ${temp} to ${offset +
					frame_size +
					temp}`
			);
			pixel_data.set(
				data.subarray(offset, (offset += frame_size)),
				pd_offset
			);
			pd_offset += frame_size;
			offset +=
				this.pixelsForMipmaps(
					this.header.frame_width / 2,
					this.header.frame_height / 2,
					this.header.min_block
				) * this.header.pixel_bytes;
		}
		console.log(offset);
		console.log(pixel_data);

		return {
			pixel_data
			// palettes: palettes
		};
	}

	tpcCheckHeader(content: Uint8Array, offset: number, buffer: ArrayBuffer) {
		switch (this.header.image_type) {
			// What the need of a file without data ?
			case TPC_TYPE_NO_MIP:
				// console.error( 'THREE.TPCLoader.parse.tpcCheckHeader: No data' );
				this.header.pixel_size = 24;
				this.header.pixel_bytes = 3;
				break;
			case TPC_TYPE_GREY:
				this.header.pixel_size = 8;
				this.header.pixel_bytes = 1;
				break;
			case TPC_TYPE_RGB:
				this.header.pixel_size = 24;
				this.header.pixel_bytes = 3;
				break;
			case TPC_TYPE_RGBA:
				this.header.pixel_size = 32;
				this.header.pixel_bytes = 4;
				break;
			case TPC_TYPE_BGRA:
				this.header.pixel_size = 32;
				this.header.pixel_bytes = 4;
				break;

			// Invalid type ?
			default:
				console.error(`THREE.TPCLoader.parse.tpcCheckHeader: Invalid type "${this.header.image_type}"`);
		}

		// Check image width and height
		if (this.header.width <= 0 || this.header.height <= 0) {
			console.error(
				'THREE.TPCLoader.parse.tpcCheckHeader: Invalid image size'
			);
		}

		const expected_mipmaps = Math.log(this.header.width) / Math.log(2);

		if (this.header.frame_pixels === 0) {
			// uncompressed data
			this.header.compressed = false;

			// compute number of pixels
			let mw = this.header.width;
			let mh = this.header.height;
			this.header.data_size = 0;
			this.header.mipmap_count = 0;
			do {
				this.header.data_size += mw * mh;
				mw = Math.floor(mw / 2);
				mh = Math.floor(mh / 2);
				this.header.mipmap_count += 1;
			} while (mw && mh);
			// header.data_size = (((header.width * header.height) * 2) - 1);
			// console.log(header.image_type);
			// console.log(TPC_TYPE_RGB);
			// header.data_size *= header.pixel_size >> 3;
			let image_data_size = content.length - offset;
			if (this.header.width < 8 && this.header.height < 8) {
				// finding TXI & data-fitting, especially mipmaps vs no mipmaps,
				// become very ambiguous at small sizes,
				// so, for very small textures, we read ascii chars from the end
				// of the file to get TXI length & offset, then use that in our
				// data fit process
				// XXX predictive is a misnomer here
				this.txiReadPredictive(buffer);
				if (this.header.txi_value && this.header.txi_value.length) {
					image_data_size -= this.header.txi_value.length;
				}
			}
			// pixel size/image type are garbage, fit data to determine pixel format
			for (const test_bytes of [4, 3, 1]) {
				console.log(
					test_bytes,
					content.length,
					offset + this.header.data_size * test_bytes
				);
				if (
					image_data_size >= this.header.data_size * test_bytes || // header.image_type == TPC_TYPE_NO_MIP &&
					image_data_size >=
						this.header.width * this.header.height * test_bytes
				) {
					console.log(`found actual bytes = ${test_bytes}`);
					// this is the actual bitness
					switch (test_bytes) {
						case 4:
							// 32-bit
							this.header.pixel_size = 32;
							this.header.pixel_bytes = 4;
							this.header.image_type = TPC_TYPE_RGBA;
							break;
						case 3:
							// 24-bit
							this.header.pixel_size = 24;
							this.header.pixel_bytes = 3;
							this.header.image_type = TPC_TYPE_RGB;
							break;
						case 1:
							// 8-bit
							this.header.pixel_size = 8;
							this.header.pixel_bytes = 1;
							this.header.image_type = TPC_TYPE_GREY;
							break;
					}
					if (
						this.header.image_type === TPC_TYPE_NO_MIP ||
						image_data_size <= this.header.data_size * test_bytes
					) {
						this.header.image_type = TPC_TYPE_NO_MIP;
						this.header.mipmap_count = 0;
						this.header.data_size = this.header.width * this.header.height;
					}
					break;
				}
			}
			// header.data_size *= header.pixel_size >> 3;
			this.header.data_size *= this.header.pixel_bytes;

			// read TXI file
			if (!this.header.txi_offset) {
				this.header.txi_offset = offset + this.header.data_size;
				if (this.header.txi_offset < content.length) {
					this.txiRead(buffer);
					// console.log(header);
					// normal maps are BGRA
					if (
						this.header.txi_value &&
						this.header.txi_value.length &&
						this.header.txi_value.match(/^\s*isbumpmap\s+1/im)
					) {
						// console.log('bumpmap detected');
						// header.image_type = TPC_TYPE_BGRA;
					}
				}
			}
		} else {
			// DXT compressed data
			this.header.compressed = true;

			// special cases
			if (this.header.width * this.header.height === this.header.frame_pixels) {
				// single frame
			} else if (
				this.header.width * this.header.width === this.header.frame_pixels &&
				this.header.height > this.header.width
			) {
				// cubemap?
				this.header.frame_count = this.header.height / this.header.width;
				this.header.numX = 1;
				this.header.numY = 6;
				this.header.frame_height = this.header.frame_width;
			} else if (
				this.header.width * this.header.height >= this.header.frame_pixels &&
				this.header.mipmap_count < expected_mipmaps
			) {
				console.log('ANIMATED PROCESSING');
				// animated texture, priority is reading the TXI so you know the layout
				this.header.txi_offset = offset + this.header.frame_pixels;
				this.txiRead(buffer);
				if (this.header.txi_value) {
					let matches;
					if (
						(matches = this.header.txi_value.match(
							/^\s*numx\s+(\d+)/im
						))
					) {
						this.header.numX = parseInt(matches[1], 10);
					} else if (
						(matches = this.header.txi_value.match(
							/^\s*defaultwidth\s+(\d+)/im
						))
					) {
						this.header.numX = this.header.width / parseInt(matches[1], 10);
					}
					if (
						(matches = this.header.txi_value.match(
							/^\s*numy\s+(\d+)/im
						))
					) {
						this.header.numY = parseInt(matches[1], 10);
					} else if (
						(matches = this.header.txi_value.match(
							/^\s*defaultheight\s+(\d+)/im
						))
					) {
						this.header.numY = this.header.height / parseInt(matches[1], 10);
					}
					if (this.header.numX && this.header.numY) {
						this.header.frame_width = this.header.width / this.header.numX;
						this.header.frame_height = this.header.height / this.header.numY;
						this.header.frame_count = this.header.numX * this.header.numY;
					} else {
						console.log('NOT ANIMATED');
						// speculative txi read likely failed, let it be attempted later
						delete this.header.txi_offset;
						delete this.header.txi_value;
					}
				} else {
					console.log('NOT ANIMATED');
					this.header.txi_offset = 0;
				}
			}

			if (this.header.image_type === TPC_TYPE_NO_MIP) {
				// image_type == 0 is maybe sometimes associated with textures that
				// have no mipmaps, if anything ... image_type is very unreliable
				this.header.mipmap_count = 0;
			}

			// fit data to determine image_type,
			// recorded image type number is routinely garbage
			let test_size = 0;
			test_size =
				this.pixelsForMipmaps(
					this.header.frame_width,
					this.header.frame_height,
					16
				) *
				this.header.frame_count *
				1;
			console.log(`dxt5 ${test_size} ${this.header.frame_pixels}`);
			if (
				test_size === this.header.frame_pixels - offset ||
				test_size === this.header.frame_pixels ||
				this.header.frame_pixels === this.header.width * this.header.height ||
				content.length >= test_size + offset
			) {
				console.log('FIT RGBA/DXT5');
				this.header.image_type = TPC_TYPE_RGBA;
				this.header.mipmap_count = 1;
			} else if (
				test_size * 0.5 === this.header.frame_pixels - offset ||
				test_size * 0.5 === this.header.frame_pixels ||
				this.header.frame_pixels ===
				this.header.width * this.header.height * 0.5 ||
				content.length >= test_size * 0.5 + offset
			) {
				console.log('FIT RGB/DXT1');
				this.header.image_type = TPC_TYPE_RGB;
				this.header.mipmap_count = 1;
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
			this.header.min_block = 0;
			switch (this.header.image_type) {
				case TPC_TYPE_GREY:
				// not convinced this exists...
				case TPC_TYPE_RGB:
					this.header.pixel_size = 24;
					this.header.pixel_bytes = 0.5;
					// XXX we have to set min_block to 16 here instead of 8,
					// it is basically working around a bug in how we are
					// gettting the number of 'pixels' via pixelsForMipmaps,
					// the issue is that the DXT numbers include the bit-depth,
					// but the uncompressed numbers do not, it happens to work
					// for DXT5 because pixel_bytes == 1,
					// for DXT1 pixel_bytes == 0.5,
					// so we are doubling the minimum blocksize until we fix it
					// header.min_block = 8;
					this.header.min_block = 16;
					break;
				case TPC_TYPE_RGBA:
					this.header.pixel_size = 32;
					this.header.pixel_bytes = 1;
					this.header.min_block = 16;
					break;
			}
			this.header.data_size = this.pixelsForMipmaps(
				this.header.frame_width,
				this.header.frame_height,
				this.header.min_block
			);
			this.header.data_size *= this.header.frame_count;
			this.header.data_size *= this.header.pixel_bytes;
			console.log(
				`DATA SIZE ${this.header.data_size} ${this.header.width} ${this.header.height}`
			);

			// read TXI if it did not happen yet
			if (!this.header.txi_value) {
				this.header.txi_offset = offset + this.header.data_size;
				this.txiRead(buffer);
			}
		}
		// console.log(header);
	}

	// Read TXI value from buffer by reading from known offset to EOF
	txiRead(buffer: ArrayBuffer) {
		console.log(this.header.txi_offset);
		console.log(buffer.slice(this.header.txi_offset));
		console.log(buffer.byteLength);
		if (this.header.txi_offset && this.header.txi_offset < buffer.byteLength) {
			this.header.txi_value = this.abuf2str(buffer.slice(this.header.txi_offset));
			// non-printing, non-ascii characters, match any
			const ascii_test = /[^ -~\t\n\r]+/im;
			if (ascii_test.test(this.header.txi_value)) {
				// invalid TXI, should not really happen, but does.
				delete this.header.txi_value;
			}
		}
	}
	// Read TXI value from buffer by reading from end forward, testing for ASCII
	txiReadPredictive(buffer: ArrayBuffer) {
		// console.log(header.txi_offset);
		// console.log(buffer.slice(header.txi_offset));
		console.log(buffer.byteLength);
		let nonascii = false;
		// let ascii_test = /^[ -~\t\n\r]+$/mi;
		let txi_offset = buffer.byteLength - 1;
		while (!nonascii && txi_offset) {
			// console.log(buffer.slice(txi_offset));
			const test_str = this.abuf2str(buffer.slice(txi_offset));
			// console.log(test_str);
			// console.log(test_str.length);
			// console.log(test_str.charCodeAt(0));
			// non-printing, non-ascii characters, match any
			const ascii_test = /[^ -~\t\n\r]+/im;
			// console.log(ascii_test.test(test_str));
			if (ascii_test.test(test_str)) {
				nonascii = true;
			} else {
				this.header.txi_value = test_str;
				this.header.txi_offset = txi_offset;
				txi_offset -= 1;
			}
		}
		console.log(
			`predictive result: offset: ${this.header.txi_offset} value: ${this.header.txi_value}`
		);
	}

	// Get number of pixels for an image of width x height plus all mipmaps
	pixelsForMipmaps(width: number, height: number, min_block: number = 0) {
		// console.log(`pixelsForMipmaps ${width} ${height} ${min_block}`);

		let num_pix = 0;
		let w = width;
		let h = height;

		do {
			num_pix += Math.max(width * height, min_block);
			// console.log(`pixelsForMipmaps ${width} ${height} ${num_pix}`);
			w = Math.floor(w / 2);
			h = Math.floor(h / 2);
			if (!this.header.mipmap_count) {
				console.log('no mipmap mode');
				w = 0;
				h = 0;
			}
		} while (w && h);
		// console.log(` == ${num_pix}`);
		return num_pix;
	}

	// ArrayBuffer to String
	abuf2str(buf: ArrayBuffer) {
		return String.fromCodePoint.apply(null, new Uint8Array(buf));
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}
}
