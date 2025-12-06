export default class PlaybackController {
	private readonly context: AudioContext;
	private source: AudioBufferSourceNode | undefined;

	public constructor() {
		this.context = new AudioContext();
	}

	public async load(audio: string): Promise<PlaybackController> {
		const response = await fetch(audio);
		const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
		this.source = this.context.createBufferSource();
		this.source.buffer = buffer;
		this.source.connect(this.context.destination);

		return this;
	}

	public play() {
		this.source?.start();
	}
}
