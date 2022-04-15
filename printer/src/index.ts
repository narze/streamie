import { getDevice } from './device';
import { pack, commands } from './packet';
import { createImageData } from './png';
import fs from 'fs';
import text2png from 'text2png';
import sharp from 'sharp';

fs.writeFileSync(
  './tmp/out.png',
  text2png('TypeScript', {
    backgroundColor: 'white',
    padding: 2,
  })
);

async function run() {
  sharp('./tmp/out.png')
    .resize(384)
    .toFile('./tmp/out_resized.png');

  let { device, transfer } = await getDevice();

  if (!device) {
    console.log('no device');
    return;
  }

  let space = (v = 1) => transfer(commands.printFeedLine(v));

  await space(150);
  await transfer(commands.paperType(0));

  for (let i = 0; i < 1; i++) {
    let buffers = await createImageData();
    for (let buffer of buffers) {
      console.log(buffers[0], buffers[0].length);
      console.log(pack(0x00, buffers[0]));
      await transfer(pack(0x00, buffer));
    }
  }

  // const text = "hello"
  // const data = new Uint8Array(
  //   text.split("").map((char) => char.charCodeAt(0))
  // )
  // console.log(pack(0x00, data.buffer))
  // const result = await device.transferOut(2, pack(0x00, data))
  // console.log({ result })

  await space(250);

  process.exit(0);
}

run();
