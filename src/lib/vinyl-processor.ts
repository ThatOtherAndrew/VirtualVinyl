class VinylProcessor extends AudioWorkletProcessor {
	private buffer: Float32Array[] | null = null;
	private currentFrame = 0;

	public constructor() {
		super();
		this.port.onmessage = (event) => {
			if (event.data.type === 'load-buffer') {
				this.buffer = event.data.buffer;
			} else if (event.data.type === 'set-position') {
				this.currentFrame = event.data.frame;
			}
		};
	}

	public static get parameterDescriptors() {
		return [
			{
				name: 'playbackRate',
				defaultValue: 0,
				minValue: -100,
				maxValue: 100,
				automationRate: 'a-rate'
			}
		];
	}

	public process(
		_inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	) {
		const output = outputs[0];
		const playbackRateParam = parameters.playbackRate;

		if (!this.buffer) return true;

		const outputLength = output[0].length;
		const channelCount = Math.min(this.buffer.length, output.length);
		const bufferLength = this.buffer[0].length;

		for (let i = 0; i < outputLength; i++) {
			const rate = playbackRateParam.length > 1 ? playbackRateParam[i] : playbackRateParam[0];

			this.currentFrame += rate;

			// boundary checks / looping
			if (this.currentFrame < 0) this.currentFrame = 0;
			if (this.currentFrame > bufferLength - 2) this.currentFrame = bufferLength - 2;

			const index = Math.floor(this.currentFrame);
			const frac = this.currentFrame - index;

			for (let channel = 0; channel < channelCount; channel++) {
				const sample1 = this.buffer[channel][index];
				const sample2 = this.buffer[channel][index + 1];
				output[channel][i] = sample1 + (sample2 - sample1) * frac;
			}
		}

		// Report position occasionally (e.g. every 100 blocks / 300ms???)
		// gods this is such a hack
		this.port.postMessage({ type: 'position', frame: this.currentFrame });

		return true;
	}
}

registerProcessor('vinyl-processor', VinylProcessor);
