class VinylProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = null;
        this.currentFrame = 0;
        this.loop = false;
        this.port.onmessage = (event) => {
            if (event.data.type === 'load-buffer') {
                this.buffer = event.data.buffer;
                this.loop = !!event.data.loop;
            } else if (event.data.type === 'set-position') {
                this.currentFrame = event.data.frame;
            } else if (event.data.type === 'set-loop') {
                this.loop = event.data.loop;
            }
        };
    }

    static get parameterDescriptors() {
        return [
            {
                name: 'playbackRate',
                defaultValue: 0,
                minValue: -100,
                maxValue: 100,
                automationRate: 'a-rate',
            },
        ];
    }

    process(_inputs, outputs, parameters) {
        const output = outputs[0];
        const playbackRateParam = parameters.playbackRate;

        if (!this.buffer) return true;

        const outputLength = output[0].length;
        const channelCount = Math.min(this.buffer.length, output.length);
        const bufferLength = this.buffer[0].length;

        for (let i = 0; i < outputLength; i++) {
            const rate =
                playbackRateParam.length > 1
                    ? playbackRateParam[i]
                    : playbackRateParam[0];

            this.currentFrame += rate;

            // boundary checks / looping
            if (this.loop) {
                this.currentFrame =
                    ((this.currentFrame % bufferLength) + bufferLength) %
                    bufferLength;
            } else {
                if (this.currentFrame < 0) this.currentFrame = 0;
                if (this.currentFrame > bufferLength - 2)
                    this.currentFrame = bufferLength - 2;
            }

            const index = Math.floor(this.currentFrame);
            const frac = this.currentFrame - index;

            for (let channel = 0; channel < channelCount; channel++) {
                if (index >= bufferLength) continue;

                const sample1 = this.buffer[channel][index];

                let nextIndex = index + 1;
                if (this.loop) {
                    if (nextIndex >= bufferLength) nextIndex = 0;
                } else if (nextIndex >= bufferLength) {
                    nextIndex = bufferLength - 1;
                }

                const sample2 = this.buffer[channel][nextIndex];
                output[channel][i] = sample1 + (sample2 - sample1) * frac;
            }
        }

        // Report position occasionally
        this.port.postMessage({ type: 'position', frame: this.currentFrame });

        return true;
    }
}

registerProcessor('vinyl-processor', VinylProcessor);
