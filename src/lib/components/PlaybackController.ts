import { ReversibleAudioBufferSourceNode } from 'simple-reversible-audio-buffer-source-node';

export default class PlaybackController {
	private readonly context: AudioContext;
	private source: ReversibleAudioBufferSourceNode | undefined;
	private lastPosition = 0;

	public constructor() {
		this.context = new AudioContext();
	}

	public async load(audio: ArrayBuffer): Promise<PlaybackController> {
		this.source = new ReversibleAudioBufferSourceNode(this.context);
		this.source.buffer = await this.context.decodeAudioData(audio);
		this.source.connect(this.context.destination);
		this.source.playbackRate(0);

		return this;
	}

	public play() {
		this.source?.start();
	}

	public scrubTo(position: number, duration: number) {
		if (!this.source || duration <= 0) return;

		const speed = (500 * (position - this.lastPosition)) / duration;
		console.log(speed);
		this.lastPosition = position;

		this.source.playbackRate(speed);
	}
}
