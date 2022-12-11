import { Transform, TransformCallback } from 'stream';

class ReverseTransform extends Transform {
    override _transform(
        chunk: Buffer,
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        const value = chunk.toString();
        const reversedValue = value
            .trimEnd()
            .split('')
            .reverse()
            .join('')
            .concat('\n');

        callback(null, reversedValue);
    }
}

const reverseTransformStream = new ReverseTransform();
process.stdin
    .pipe(reverseTransformStream)
    .pipe(process.stdout);
