import { KotorFile } from "./kotor-file";
import { Texture } from "three";

const dxt = require("decode-dxt");

interface TPCHeader {
	frame_pixels?: number;
	alpha_blending?: number;
	width?: number;
	height?: number;
	image_type?: number;
	mipmap_count?: number;
	numX?: number;
	numY?: number;
	compressed?: boolean;
	pixel_size?: number;
	cubemap?: boolean;
	frame_count?: number;
	frame_width?: number;
	frame_height?: number;
	data_size?: number;
	txi_offset?: number;
	txi_value?: string;
}

interface TPCRanges {
	width: number;
	height: number;
	start: number;
	end: number;
}

interface TPCTexture extends THREE.Texture {
	pixelDepth?: number;
	extensionString?: string;
	alphaBlending?: number;
}



// TPC Constants
const TPC_TYPE_NO_MIP = 0,
	TPC_TYPE_GREY = 1,
	TPC_TYPE_RGB = 2,
	TPC_TYPE_RGBA = 4,
	TPC_TYPE_BGRA = 12;

// TPC Size Constants
const SIZE_HEADER = 128;

/*

 * @author ndixUR / https://github.com/ndixUR/
 * @author mrdoob / http://mrdoob.com/
 */

export class TPC extends KotorFile {
	header: TPCHeader;
	texture: TPCTexture;
	arrayBuf: ArrayBuffer;

	constructor(
		public fileName: string,
		public fileExtension: string,
		public buffer: Buffer
	) {
		super(fileName, fileExtension, buffer);
	}

	toArrayBuffer(buf: Buffer) {
		var ab = new ArrayBuffer(buf.length);
		var view = new Uint8Array(ab);
		for (var i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
		}
		return ab;
	}

	decompile(): void {
		const texture: TPCTexture = new Texture();

		// var loader = new THREE.XHRLoader(this.manager);
		// loader.setResponseType("arraybuffer");

		try {
			const tpcData = this.parse(this.buffer);
			// store pixel data in unpremultiplied state to prevent damage
			//texture.mipmaps.push(tpcData.pixelData);
			texture.mipmaps = texture.mipmaps.concat(tpcData.mipmaps);

			// construct preview canvas
			var canvas = document.createElement("canvas");
			canvas.width = tpcData.header.width;
			canvas.height = tpcData.header.height;

			var context = canvas.getContext("2d");
			var imageData = context.createImageData(
				canvas.width,
				canvas.height
			);
			imageData.data.set(tpcData.pixelData);
			context.putImageData(imageData, 0, 0);
			texture.image = canvas;

			// record pixel depth
			texture.pixelDepth = tpcData.pixelDepth;

			texture.extensionString = tpcData.txiValue;

			texture.alphaBlending = tpcData.header.alpha_blending;
			//texture.image = scope.parse( buffer );
			//console.log('scope parsed');
		} catch (err) {
			console.log(err);
			return;
		}
		if (
			texture.image &&
			texture.image.hasAttribute &&
			texture.image.hasAttribute("pixelDepth")
		) {
			texture.pixelDepth = parseInt(
				texture.image.getAttribute("pixelDepth")
			);
			texture.image.removeAttribute("pixelDepth");
		}
		//console.log(texture.image);
		if (
			texture.image &&
			texture.image.hasAttribute &&
			texture.image.hasAttribute("txiValue")
		) {
			texture.extensionString = texture.image.getAttribute("txiValue");
			texture.image.removeAttribute("txiValue");
		}
		if (
			texture.image &&
			texture.image.hasAttribute &&
			texture.image.hasAttribute("alphaBlending")
		) {
			texture.alphaBlending = texture.image.getAttribute("alphaBlending");
			texture.image.removeAttribute("alphaBlending");
		}
		// texture.sourceFile = url;
		texture.needsUpdate = true;
		this.texture = texture;
	}

	/*
	 * headerRead
	 *   Read the TPC header, initialize derived data,
	 *   do non-TXI-based derived header data
	 */
	headerRead(buffer: Buffer): TPCHeader {
		if (buffer.length < SIZE_HEADER) {
			console.error(
				"THREE.TPCLoader.parse: Not enough data to contain header."
			);
		}

		const header: TPCHeader = {};
		const buf_view = new DataView(this.toArrayBuffer(buffer));

		header.frame_pixels = buf_view.getUint32(0, true);
		header.alpha_blending = buf_view.getFloat32(4, true);
		header.width = buf_view.getUint16(8, true);
		header.height = buf_view.getUint16(10, true);
		header.image_type = buf_view.getUint8(12);
		header.mipmap_count = buf_view.getUint8(13);

		// extra default values
		header.numX = 1;
		header.numY = 1;

		// interpret header
		header.compressed = header.frame_pixels > 0;
		header.pixel_size = 32;
		if (header.image_type == TPC_TYPE_RGB) {
			header.pixel_size = 24;
		} else if (header.image_type == TPC_TYPE_GREY) {
			header.pixel_size = 8;
			header.compressed = false;
		}

		// detect cube map, this is how odyssey does it :(
		if (header.height == header.width * 6) {
			header.cubemap = true;
			header.numX = 1;
			header.numY = 6;
			header.frame_count = 6;
			header.frame_width = header.width;
			header.frame_height = header.height / 6;
		}

		// determine data size
		header.data_size = header.frame_pixels;
		if (!header.compressed) {
			// compute uncompressed data size
			header.data_size = this.uncompressedDataSize(header);
		} else if (header.cubemap && header.mipmap_count > 1) {
			header.data_size =
				this.dataSize(
					header,
					header.frame_width,
					header.frame_height,
					true,
					header.mipmap_count
				) * header.frame_count;
		} else if (header.mipmap_count > 1) {
			// compute compressed data size w/ all mipmaps
			header.data_size = this.dataSize(
				header,
				header.width,
				header.height,
				true,
				header.mipmap_count
			);
		}

		return header;
	}

	/*
	 * uncompressedDataSize
	 *   Compute expected size of uncompressed data using header data:
	 *   width, height, and mipmap_count
	 */
	uncompressedDataSize(header: TPCHeader) {
		let size = 0;
		let w = header.width;
		let h = header.height;
		// uncompressed 32-bit
		let pixel_bytes = 4;
		if (header.image_type == TPC_TYPE_RGB) {
			// uncompressed 24-bit
			pixel_bytes = 3;
		} else if (header.image_type == TPC_TYPE_GREY) {
			// uncompressed 8-bit
			pixel_bytes = 1;
		}
		for (let i = 0; i < header.mipmap_count; i++) {
			size += w * h * pixel_bytes;
			w = Math.max(w / 2, 1);
			h = Math.max(h / 2, 1);
		}
		return size;
	}

	/*
	 * dataSize
	 *   Compute expected size of w by h image data using compression
	 *   specified in header
	 *   mipmap - whether to include lower detail levels in total
	 *   detail_levels - maximum number of additional detail levels to include
	 */
	dataSize(
		header: TPCHeader,
		w: number,
		h: number,
		mipmap = true,
		detail_levels: number = null
	) {
		let size = 0;
		// DXT5 or Uncompressed 32-bit
		let pixel_bytes = header.compressed ? 1 : 4;
		let min_block = header.compressed ? 16 : 0;
		if (header.image_type == TPC_TYPE_RGB) {
			// DXT1 or Uncompressed 24-bit
			pixel_bytes = header.compressed ? 0.5 : 3;
			min_block = header.compressed ? 8 : 0;
		} else if (header.image_type == TPC_TYPE_GREY) {
			// Uncompressed 8-bit
			pixel_bytes = 1;
		}
		if (header.compressed && (w % 4 || h % 4)) {
			// DXT 4x4 blocks are not going to evenly distribute here,
			// need to do the harder size calculation
			size += Math.max(
				min_block,
				Math.trunc((w + 3) / 4) * Math.trunc((h + 3) / 4) * min_block
			);
		} else {
			size += Math.max(min_block, w * h * pixel_bytes);
		}
		//console.log(size, min_block, w, h, pixel_bytes);
		w = Math.floor(w / 2);
		h = Math.floor(h / 2);
		if (
			mipmap &&
			(w > 0 || h > 0) &&
			(detail_levels === null || detail_levels-- > 1)
		) {
			// recurse for lower detail levels
			size += this.dataSize(
				header,
				w || 1,
				h || 1,
				mipmap,
				detail_levels
			);
		}
		//console.log(`total size ${size}`);
		return size;
	}

	/*
	 * txiGetOffset
	 *   Compute likely position of TXI information at the end of TPC file,
	 *   and apply a couple guard-rails for bad TXI locations
	 */
	txiGetOffset(header: TPCHeader, content: Uint8Array) {
		let data_size = header.data_size;
		//frame_pixels;
		header.txi_offset = data_size + SIZE_HEADER;
		console.log(`${header.txi_offset} ${content.byteLength}`);
		if (
			header.txi_offset >= content.byteLength ||
			this.dataSize(header, header.width, header.height) + SIZE_HEADER ==
				content.byteLength
		) {
			// offset past the end, or,
			// predicted data size matches exact file size,
			// probably no TXI
			header.txi_offset = 0;
		}
	}

	/*
	 * abuf2str
	 *   ArrayBuffer to String helper function that behaves on MS platform
	 */
	abuf2str(buf: Buffer) {
		//console.log('fucking windows abuf2str');
		//console.log(buf);
		let str = "";
		const strbuf = new Uint8Array(buf);
		for (let i of strbuf) {
			//try { str += String.fromCharCode(i); }
			try {
				str += String.fromCodePoint(i);
			} catch (err) {
				console.log(err);
				break;
			}
		}
		console.log(str);
		return str;
		//return String.fromCodePoint.apply(null, new Uint8Array(buf));
		//return String.fromCharCode.apply(null, new Uint8Array(buf));
	}

	/*
	 * txiReadPredictive
	 *   Read TXI value starting from last character and expanding down into
	 *   buffer until non-ascii characters are encountered
	 *   The last resort TXI reading mechanism
	 */
	txiReadPredictive(header: TPCHeader, buffer: Buffer) {
		//console.log(header.txi_offset);
		//console.log(buffer.slice(header.txi_offset));
		//console.log(buffer.byteLength);
		let nonascii = false;
		//let ascii_test = /^[ -~\t\n\r]+$/mi;
		let txi_offset = buffer.byteLength - 1;
		while (!nonascii && txi_offset) {
			//console.log(buffer.slice(txi_offset));
			let test_str = this.abuf2str(buffer.slice(txi_offset));
			//console.log(test_str);
			//console.log(test_str.length);
			//console.log(test_str.charCodeAt(0));
			// non-printing, non-ascii characters, match any
			let ascii_test = /[^ -~\t\n\r]+/im;
			//console.log(ascii_test.test(test_str));
			if (ascii_test.test(test_str)) {
				nonascii = true;
			} else {
				header.txi_value = test_str;
				header.txi_offset = txi_offset;
				txi_offset -= 1;
			}
		}
		console.log(
			`predictive result: ` +
				`offset: ${header.txi_offset} value: ${header.txi_value}`
		);
	}

	/*
	 * txiRead
	 *   Read TXI value starting from known offset and proceeding until EOF
	 *   The first attempt TXI reading mechanism
	 */
	txiRead(header: TPCHeader, buffer: Buffer) {
		//console.log(buffer.slice(header.txi_offset));
		//console.log(buffer.byteLength);
		if (header.txi_offset && header.txi_offset < buffer.byteLength) {
			console.log(`read TXI @${header.txi_offset}b`);
			//console.log('do abuf2str');
			header.txi_value = this.abuf2str(buffer.slice(header.txi_offset));
			//console.log('abuf2str happened');
			// non-printing, non-ascii characters, match any
			let ascii_test = /[^ -~\t\n\r]+/im;
			if (ascii_test.test(header.txi_value)) {
				// invalid TXI, should not really happen.
				console.log(
					`deleted invalid TXI data: ${header.txi_value.length} bytes`
				);
				delete header.txi_value;
				// attempt to get TXI data by reading from EOF to first non-ascii char
				this.txiReadPredictive(header, buffer);
			}
		}
		//console.log('return txiRead');
	}

	/*
	 * txiParse
	 *   Parse the TXI value stored in header, adjusting header as needed
	 */
	txiParse(header: TPCHeader) {
		if (!header.txi_value || !header.txi_value.length) {
			return;
		}
		let matches;
		if ((matches = header.txi_value.match(/^\s*cube\s+([1TtYy])/im))) {
			// this was already determined by the 1:6 ratio in headerRead
			header.cubemap = true;
			header.numX = 1;
			header.numY = 6;
		}
		if (header.txi_value.match(/^\s*proceduretype\s+cycle/im)) {
			// TPC contains animated texture frames, determine frame size & layout
			if ((matches = header.txi_value.match(/^\s*numx\s+(\d+)/im))) {
				header.numX = parseInt(matches[1]);
			} else if (
				(matches = header.txi_value.match(/^\s*defaultwidth\s+(\d+)/im))
			) {
				header.numX = header.width / parseInt(matches[1]);
			}
			if ((matches = header.txi_value.match(/^\s*numy\s+(\d+)/im))) {
				header.numY = parseInt(matches[1]);
			} else if (
				(matches = header.txi_value.match(
					/^\s*defaultheight\s+(\d+)/im
				))
			) {
				header.numY = header.height / parseInt(matches[1]);
			}
		}
		/* PLC_FrcDist01 - waterwidth/height aren't multiple frame
		if (header.txi_value.match(/^\s*proceduretype\s+water/im)) {
		  if (matches = header.txi_value.match(/^\s*waterwidth\s+(\d+)/im)) {
			header.numX = header.width / parseInt(matches[1]);
		  }
		  if (matches = header.txi_value.match(/^\s*waterheight\s+(\d+)/im)) {
			header.numY = header.height / parseInt(matches[1]);
		  }
		}
		*/
	}

	/*
	 * headerFinalize
	 *   Finalize the header, maybe using parsed TXI information to determine
	 *   correct frame count, size, and layout
	 */
	headerFinalize(header: TPCHeader) {
		// adjust frame dimensions for multi-frame textures
		header.frame_width = header.width;
		header.frame_height = header.height;
		header.frame_count = 1;
		if (header.numX || header.numY) {
			header.numX = header.numX || 1;
			header.numY = header.numY || 1;
			header.frame_width = Math.floor(header.width / header.numX);
			header.frame_height = Math.floor(header.height / header.numY);
			header.frame_count = header.numX * header.numY;
		}
		console.log(header);
	}

	/*
	 * createRanges
	 *   Generate a structure containing width, height, and byte ranges,
	 *   for each frame and detail level
	 *   Returned structure used to read image data from file buffer
	 */
	createRanges(header: TPCHeader) {
		const ranges: TPCRanges[][] = [];
		let w = header.frame_width,
			h = header.frame_height;
		// dsize is size of data for a full frame, all detail levels
		let dsize = this.dataSize(header, w, h);
		let mips = header.mipmap_count;
		if (mips == 1 && header.frame_count > 1) {
			// use calculated number of mipmaps if multi-frame texture has count = 1,
			// retain mips == 1 for single-frame, as this is how mipmap 0 textures are
			mips = Math.log(Math.max(w, h)) / Math.log(2) + 1;
		}
		for (let frame_idx = 0; frame_idx < header.frame_count; frame_idx++) {
			let start = frame_idx * dsize;
			let mw = w,
				mh = h;
			ranges[frame_idx] = [];
			for (let mip_idx = 0; mip_idx < mips; mip_idx++) {
				// for end, add size of data for this detail level to start
				const end = start + this.dataSize(header, mw, mh, false);
				ranges[frame_idx][mip_idx] = {
					width: mw,
					height: mh,
					start: start,
					end: end
				};
				// advance start and update detail level width & height
				start = end;
				mw = Math.max(mw / 2, 1);
				mh = Math.max(mh / 2, 1);
			}
		}
		console.log(ranges);
		return ranges;
	}

	/*
	 * originBLtoUL
	 *   Invert rows to go from OpenGL style bottom-left origin to
	 *   the standard in other contexts, upper-left origin
	 *   The function is just a flip vertical, nothing special
	 */
	originBLtoUL(data: Uint8Array, dim: TPCRanges) {
		const row_size = dim.width * 4;
		const row_buffer = new Uint8ClampedArray(row_size);
		for (let src_y = 0; src_y < dim.height / 2; src_y++) {
			// swapping row y w/ row h - y
			const tgt_y = dim.height - 1 - src_y;
			if (tgt_y == src_y) {
				break;
			}
			const tgt_offset = tgt_y * row_size;
			const src_offset = src_y * row_size;
			/*
		  console.log(
			`${row_size} ${src_y} <=> ${tgt_y} ` +
			`${src_offset} ${src_offset + row_size} - ${tgt_offset} ${tgt_offset + row_size}`
		  );
		  */
			row_buffer.set(data.subarray(tgt_offset, tgt_offset + row_size));
			data.set(
				data.subarray(src_offset, src_offset + row_size),
				tgt_offset
			);
			data.set(row_buffer, src_offset);
		}
		return data;
	}

	/*
	 * tpcGetImageData
	 *   Entrypoint into retrieving image data from a full byte array,
	 *   requires the frame dimensions also in order to function
	 */
	tpcGetImageData(header: TPCHeader, data: Uint8Array, dim: TPCRanges) {
		console.log(
			`read ${dim.width}x${dim.height} ${data.byteLength}b @${data.byteOffset}`
		);
		// read the image data and vertical flip (reorient) the result
		return this.originBLtoUL(
			header.compressed
				? this.tpcGetImageDataDXT(header, data, dim)
				: this.tpcGetImageDataRaw(header, data, dim),
			dim
		);
	}

	/*
	 * tpcGetImageDataDXT
	 *   Get DXT compressed image data from the provided byte array using
	 *   dimensions provided in `dim`
	 */
	tpcGetImageDataDXT(header: TPCHeader, data: Uint8Array, dim: TPCRanges) {
		const algo = header.image_type == TPC_TYPE_RGBA ? dxt.dxt5 : dxt.dxt1;
		//if (dim.width < 4 || dim.height < 4) {
		//  console.log(data);
		//}
		const image = dxt(
			new DataView(data.buffer, data.byteOffset, data.byteLength),
			dim.width,
			dim.height,
			algo
		);

		// image is typed array of bytes
		//console.log(image);
		return image;
	}

	/*
	 * tpcGetImageDataRaw
	 *   Get raw pixel image data from the provided byte array using
	 *   dimensions provided in `dim`
	 */
	tpcGetImageDataRaw(header: TPCHeader, data: Uint8Array, dim: TPCRanges) {
		// prepare RGBA byte array for output
		const pixels = new Uint8ClampedArray(dim.width * dim.height * 4);
		let i = 0,
			x = 0,
			y = 0;

		// determine size of pixels in bytes
		// TPC_TYPE_RGBA
		let pixel_bytes = 4;
		if (header.image_type == TPC_TYPE_RGB) {
			pixel_bytes = 3;
		} else if (header.image_type == TPC_TYPE_GREY) {
			pixel_bytes = 1;
		}

		for (y = 0; y < dim.height; y++) {
			for (x = 0; x < dim.width; x++, i += pixel_bytes) {
				const pix_data_pos = (x + dim.width * y) * 4;
				pixels[pix_data_pos + 0] = data[i + 0];
				pixels[pix_data_pos + 1] =
					pixel_bytes > 1 ? data[i + 1] : data[i + 0];
				pixels[pix_data_pos + 2] =
					pixel_bytes > 1 ? data[i + 2] : data[i + 0];
				pixels[pix_data_pos + 3] = pixel_bytes > 3 ? data[i + 3] : 255;
			}
		}
		//console.log(pixels);
		return pixels;
	}

	parse(buffer: Buffer) {
		// DXT Decoding library

		// Parse-global variables,
		// content is the bytes read from the file
		// header is a structure containing the literal TPC header information,
		//   in addition to various data derived from literal header data

		//
		// MAIN EXECUTION ENTRYPOINT FOR PARSE
		//

		const content = new Uint8Array(buffer);

		// read TPC header
		const header = this.header = this.headerRead(buffer);

		// find TXI data
		this.txiGetOffset(header, content);

		// read TXI data
		this.txiRead(header, buffer);

		// parse TXI data for cubemaps and animated textures
		this.txiParse(header);

		// finish calculating dimensions based on parsed TXI values
		this.headerFinalize(header);

		// create the ranges for each frame & detail level in the source image data
		const datamap = this.createRanges(header);

		// structure for storing output image data
		const rgbaFrames: any[] = [];

		// read the image data into rgbaFrames structure
		for (let frame_idx = 0; frame_idx < datamap.length; frame_idx++) {
			console.log(`frame ${frame_idx}`);
			rgbaFrames[frame_idx] = [];
			for (
				let mip_idx = 0;
				mip_idx < datamap[frame_idx].length;
				mip_idx++
			) {
				const range = datamap[frame_idx][mip_idx];
				rgbaFrames[frame_idx][mip_idx] = this.tpcGetImageData(
					header,
					content.subarray(
						SIZE_HEADER + range.start,
						SIZE_HEADER + range.end
					),
					range
				);
			}
		}

		// structure for storing combined-frame, final image data
		const mipmaps: any[] = [];

		// lay out the final output image data according to specification
		for (let mip_idx = 0; mip_idx < datamap[0].length; mip_idx++) {
			// the trivial case, no layout necessary,
			// just stuff frame[0] highest detail level into our output
			mipmaps[mip_idx] = rgbaFrames[0][mip_idx];

			const fw = Math.max(header.frame_width / Math.pow(2, mip_idx), 1);
			const fh = Math.max(header.frame_height / Math.pow(2, mip_idx), 1);
			console.log(`mipmap ${mip_idx} ${fw}x${fh}`);
			if (header.frame_count > 1 && header.numX > 1) {
				// multiple images per row, must use row-based approach
				mipmaps[mip_idx] = new Uint8ClampedArray(
					fw * fh * 4 * header.frame_count
				);

				for (let out_y = 0; out_y < fh * header.numY; out_y++) {
					for (let out_x = 0; out_x < fw * header.numX; out_x += fw) {
						// out_y is each row,
						// out_x is each position in new image where a row should start,
						// if numX == 2 & image width 512, out_y = 0, 256, 0, 256, ...
						const frame_idx =
							Math.floor(out_y / fh) * header.numX +
							Math.floor(out_x / fw);
						// byte offset for start of source row data
						const ins_from = ((out_y % fh) * fw + (out_x % fw)) * 4;
						const ins_from_end = ins_from + fw * 4;
						// byte offset in final image for source row to be inserted at
						const ins_at = (out_y * (fw * header.numX) + out_x) * 4;

						mipmaps[mip_idx].set(
							rgbaFrames[frame_idx][mip_idx].subarray(
								ins_from,
								ins_from + fw * 4
							),
							(out_y * fw * header.numX + out_x) * 4
						);
					}
				}
			} else if (header.frame_count > 1) {
				// single images per byte region, use whole-image-based approach
				mipmaps[mip_idx] = new Uint8ClampedArray(
					fw * fh * 4 * header.frame_count
				);
				let ins_offset = 0;
				for (let frame of rgbaFrames) {
					(mipmaps[mip_idx] as any).set(frame[mip_idx], ins_offset);
					ins_offset += frame[mip_idx].byteLength;
				}
			}
			// construct preview canvas for this detail level
			/*
		const canvas = document.createElement('canvas');
		canvas.width = fw * header.numX;
		canvas.height = fh * header.numY;

		const context = canvas.getContext( '2d' );
		const imageData = context.createImageData( canvas.width, canvas.height );
		imageData.data.set(mipmaps[mip_idx]);
		context.putImageData(imageData, 0, 0 );
		document.body.firstChild.appendChild(canvas);
		*/
		}

		return {
			// pixelData provided for legacy reasons, just highest detail level
			pixelData: mipmaps[0],
			// all detail levels
			mipmaps,
			// information that may be useful to external consumer of texture
			header,
			// header information broken out for legacy reasons
			pixelDepth: header.pixel_size,
			txiValue: header.txi_value
		};
	}
}
