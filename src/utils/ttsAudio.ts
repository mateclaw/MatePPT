export function base64ToBytes(b64: string): Uint8Array {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

export function bytesStartWith(bytes: Uint8Array, s: string) {
    if (bytes.length < s.length) return false;
    for (let i = 0; i < s.length; i++) {
        if (bytes[i] !== s.charCodeAt(i)) return false;
    }
    return true;
}

/** ===== WAV header builder (PCM -> WAV) ===== */
export function buildWavHeader({
    dataByteLength,
    sampleRate,
    channels,
    bitsPerSample,
}: {
    dataByteLength: number;
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
}): Uint8Array {
    const blockAlign = (channels * bitsPerSample) >> 3;
    const byteRate = sampleRate * blockAlign;

    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    const writeStr = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataByteLength, true);
    writeStr(8, 'WAVE');

    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM fmt chunk size
    view.setUint16(20, 1, true); // audio format = 1 (PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    writeStr(36, 'data');
    view.setUint32(40, dataByteLength, true);

    return new Uint8Array(buffer);
}

export function safeRevokeObjectUrl(url: string | null) {
    if (!url) return;
    try {
        URL.revokeObjectURL(url);
    } catch {
        // ignore
    }
}
