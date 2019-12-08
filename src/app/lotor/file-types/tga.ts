export function writeTGA(canvas, filename, settings) {
	// TGA Constants
	const TGA_TYPE_NO_DATA = 0,
		TGA_TYPE_INDEXED = 1,
		TGA_TYPE_RGB = 2,
		TGA_TYPE_GREY = 3,
		TGA_TYPE_RLE_INDEXED = 9,
		TGA_TYPE_RLE_RGB = 10,
		TGA_TYPE_RLE_GREY = 11,
		TGA_ORIGIN_MASK = 0x30,
		TGA_ORIGIN_SHIFT = 0x04,
		TGA_ORIGIN_BL = 0x00,
		TGA_ORIGIN_BR = 0x01,
		TGA_ORIGIN_UL = 0x02,
		TGA_ORIGIN_UR = 0x03;

	settings = settings || {};
	settings.height = settings.height || canvas.height;
	settings.width = settings.width || canvas.width;

	console.log(settings);

	let context = canvas.getContext("2d");
	let imageData = context.getImageData(0, 0, settings.width, settings.height);

	// header len 18b
	// use bottom-left origin
	// no RLE
	// 24 or 32 bit pixel depth

	let header = new Uint8ClampedArray(18);
	header.fill(0);
	header[2] = TGA_TYPE_RGB;
	header[12] = settings.width & 0x00ff;
	header[13] = (settings.width & 0xff00) >> 8;
	header[14] = settings.height & 0x00ff;
	header[15] = (settings.height & 0xff00) >> 8;
	header[16] = settings.pixel_size;

	//console.log(header);
	//console.log(imageData.data);
	//console.log(header.length);
	//console.log(imageData.data.length);
	//console.log(header.buffer.length + imageData.data.buffer.length);
	//let image = new Uint8Array(header.length + imageData.data.length);
	let tga_size =
		settings.width * settings.height * (settings.pixel_size >> 3);
	let image = new Uint8Array(header.length + tga_size);
	//console.log(image.buffer.length);
	image.set(header, 0);

	// imageData is RGBA
	// TGA wants BGR[A]
	// Do a pass on imageData, construct new

	// can't do this
	//image.set(imageData.data, 18);

	let tga_offset = 18;
	for (let y = settings.height - 1; y >= 0; y--) {
		for (let x = 0; x < settings.width; x++) {
			// 4, not pixel_size, because image data always RGBA
			let img_offset = (settings.width * y + x) * 4;
			//console.log(`${x} ${y} ${tga_offset} ${img_offset}`);
			image[tga_offset + 0] = imageData.data[img_offset + 2];
			image[tga_offset + 1] = imageData.data[img_offset + 1];
			image[tga_offset + 2] = imageData.data[img_offset + 0];
			if (settings.pixel_size > 24) {
				image[tga_offset + 3] = imageData.data[img_offset + 3];
			}
			tga_offset += settings.pixel_size >> 3;
		}
	}

	console.log(image);
	console.log(filename);
	require("fs").writeFileSync(filename, Buffer.from(image.buffer));
}
