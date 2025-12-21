import workerCode from '../vinyl-processor-string';

export default class PlaybackController {
    private _context: AudioContext | undefined;
    private node: AudioWorkletNode | undefined;
    private lastPosition = 0;
    public currentFrame = 0;

    private get context(): AudioContext {
        if (!this._context) {
            this._context = new AudioContext();
        }
        return this._context;
    }

    public async load(audio: ArrayBuffer): Promise<PlaybackController> {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const vinylProcessorUrl = URL.createObjectURL(blob);

        try {
            await this.context.audioWorklet.addModule(vinylProcessorUrl);
        } catch (e) {
            console.error('Failed to load module', e);
        } finally {
            URL.revokeObjectURL(vinylProcessorUrl);
        }

        this.node = new AudioWorkletNode(this.context, 'vinyl-processor');

        this.node.port.onmessage = (event) => {
            if (event.data.type === 'position') {
                this.currentFrame = event.data.frame;
            }
        };

        const audioBuffer = await this.context.decodeAudioData(audio);

        this.node.port.postMessage({
            type: 'load-buffer',
            buffer: this.getMultiChannelBuffer(audioBuffer),
        });

        this.node.connect(this.context.destination);

        return this;
    }

    public async loadFromUrl(url: string): Promise<PlaybackController> {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return await this.load(buffer);
    }

    private getMultiChannelBuffer(audioBuffer: AudioBuffer): Float32Array[] {
        const channels: Float32Array[] = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }
        return channels;
    }

    public async resumePlayback() {
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    public scrubTo(position: number, duration: number) {
        if (!this.node || duration <= 0) return;

        // Calculate required velocity to move from lastPosition -> position in duration ms
        // Velocity in radians/ms
        const velocity = (position - this.lastPosition) / duration;
        this.lastPosition = position;

        // Convert to playbackRate
        // 1.0 playbackRate = 2 radians/second = 0.002 radians/ms
        const playbackRate = velocity / 0.002;

        const param = this.node.parameters.get('playbackRate');
        if (!param) return;

        param.cancelScheduledValues(this.context.currentTime);
        param.setTargetAtTime(
            playbackRate,
            this.context.currentTime + duration / 1000,
            0.1,
        );
    }

    public getCurrentTime(): number {
        return this.currentFrame / this.context.sampleRate;
    }
}
