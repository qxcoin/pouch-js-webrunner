import rfs from 'rotating-file-stream';
import path from 'path';

interface Options extends Omit<rfs.Options, 'path'> {
  destination: string,
}

export default function (options: Options) {
  const { destination, ...opts } = options;
  const filename = path.basename(destination);
  const dirname = path.dirname(destination);
  return rfs.createStream(filename, { ...opts, path: dirname });
}
