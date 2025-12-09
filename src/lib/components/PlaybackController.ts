import vinylProcessorUrl from '$lib/vinyl-processor.ts?url';

export default class PlaybackController {
    private readonly context: AudioContext;
    private node: AudioWorkletNode | undefined;
    private lastPosition = 0;
    public currentFrame = 0;

    public constructor() {
        this.context = new AudioContext();
    }

    public async load(audio: ArrayBuffer): Promise<PlaybackController> {
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }

        try {
            await this.context.audioWorklet.addModule(vinylProcessorUrl);
        } catch (e) {
            console.error('Failed to load module', e);
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

    private getMultiChannelBuffer(audioBuffer: AudioBuffer): Float32Array[] {
        const channels: Float32Array[] = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }
        return channels;
    }

    public play() {
        if (this.context.state === 'suspended') {
            this.context.resume();
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
