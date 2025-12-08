export default class PlaybackController {
	private readonly context: AudioContext;
	private source: AudioBufferSourceNode | undefined;
	private lastPosition = 0;

	public constructor() {
		this.context = new AudioContext();
	}

	public async load(audio: ArrayBuffer): Promise<PlaybackController> {
		this.source = this.context.createBufferSource();
		this.source.buffer = await this.context.decodeAudioData(audio);
		this.source.connect(this.context.destination);
		this.source.playbackRate.value = 0;

		return this;
	}

	public play() {
		this.source?.start();
	}

	public scrubTo(position: number, duration: number) {
		if (!this.source || duration <= 0) return;

		const speed = 100 * (position - this.lastPosition / duration);
		console.log(speed);
		this.lastPosition = position;

		this.source.playbackRate.setTargetAtTime(speed, this.context.currentTime, 0.05);
	}
}
