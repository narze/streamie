import text2png from 'text2png';
import sharp from 'sharp';
import { io, Socket } from 'socket.io-client';

import { getDevice } from './device';
import { pack, commands } from './packet';
import { createImageDataFromBuffer } from './png';

interface ServerToClientEvents {
  say: ({ message, username }: { message: string; username: string }) => void;
  print: ({ text }: { text: string }) => void;
}

interface ClientToServerEvents {}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  'ws://streamie-socket.narze.live'
);

let printQueue: string[] = [];
let isPrinting = false;
let device, transfer;

async function connectPrinter() {
  const printer = await getDevice();

  device = printer.device;
  transfer = printer.transfer;

  if (!device) {
    console.log('no device');
    process.exit(1);
  }
}

socket.on('say', ({ message, username }) => {
  // console.log({ message, username, language, slow });

  // Test printing
  if (username === 'narzelive' && message.startsWith('print ')) {
    printText(message.split('print ')[1]);
  }
});

socket.on('print', async ({ text }) => {
  console.log({ text });

  // await printText(text);

  // Add to print queue
  printQueue.push(text.substring(0, 50));
  await printFromQueue();
});

async function printFromQueue() {
  if (isPrinting || !printQueue.length) {
    return;
  }

  const text = printQueue[0];

  isPrinting = true;
  await printText(text);
  isPrinting = false;
  printQueue = printQueue.slice(1);
}

async function printText(text: string) {
  if (!text) {
    return;
  }

  const png = text2png(text.match(/.{1,30}/g)!.join('\n'), {
    backgroundColor: 'white',
    padding: 2,
  });

  const bufferImg = await sharp(png)
    .resize(384)
    .toBuffer();

  let space = (v = 1) => transfer(commands.printFeedLine(v));

  // await space(50);
  await transfer(commands.paperType(0));

  for (let i = 0; i < 1; i++) {
    let buffers = await createImageDataFromBuffer(bufferImg);
    for (let buffer of buffers) {
      // console.log(buffers[0], buffers[0].length);
      // console.log(pack(0x00, buffers[0]));
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

  await space(200);

  console.log(`Printed: "${text}"`);
}

(async () => {
  await connectPrinter();
  printQueue.push('Printer is ready,  Bit/Sub to see it in action!');
})();

setInterval(() => {
  printFromQueue();
}, 5000);
