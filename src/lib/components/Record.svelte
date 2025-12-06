<script lang="ts">
	import PlaybackController from './PlaybackController.ts';

	let { img, audio } = $props();

	const HOVER_SKEW_STRENGTH = 1.5;
	const DRAG_SKEW_STRENGTH = 5;

	let record: HTMLDivElement;
	let skewX = $state(0);
	let skewY = $state(0);
	let recordAngle = $state(0);
	let isDragging = $state(false);
	let dragAngleOffset = $state(0);

	function getPointerEventMeasurements(event: PointerEvent) {
		const rect = record.getBoundingClientRect();

		// position of pointer event (relative to bounding rect)
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// position of centre (relative to bounding rect)
		const centreX = rect.width / 2;
		const centreY = rect.height / 2;

		// offset from centre
		const dx = x - centreX;
		const dy = y - centreY;

		// distance to centre
		const distance = Math.sqrt(dx * dx + dy * dy);

		// angle from centre to pointer event (in radians)
		const angle = Math.atan2(dy, dx);

		return { x, y, dx, dy, centreX, centreY, distance, angle };
	}

	function hoverSkew(event: PointerEvent) {
		if (isDragging) return;

		const { dx, dy, centreX, centreY } = getPointerEventMeasurements(event);

		skewY = (dx / centreX) * HOVER_SKEW_STRENGTH;
		skewX = -(dy / centreY) * HOVER_SKEW_STRENGTH;
	}

	function resetHoverSkew() {
		if (isDragging) return;

		skewX = 0;
		skewY = 0;
	}

	function startDrag(event: PointerEvent) {
		console.log('le dragge');
		isDragging = true;
		window.addEventListener('pointermove', drag);
		window.addEventListener('pointerup', endDrag, { once: true });
		drag(event);
	}

	function drag(event: PointerEvent) {
		const { dx, dy, distance, angle } = getPointerEventMeasurements(event);

		// exaggerated skew
		console.log(distance);
		if (distance > 0) {
			skewY = (dx / distance) * DRAG_SKEW_STRENGTH;
			skewX = -(dy / distance) * DRAG_SKEW_STRENGTH;
		} else {
			skewX = 0;
			skewY = 0;
		}

		// rotate record when dragged
		recordAngle = angle - dragAngleOffset;
	}

	function endDrag(event: PointerEvent) {
		isDragging = false;
		hoverSkew(event);
		window.removeEventListener('pointermove', drag);
	}

	$effect(() => {
		const controller = new PlaybackController();
		controller.load(audio).then((controller) => controller.play());
	});
</script>

<div>
	dragAngleOffset: {dragAngleOffset}
</div>
<div
	onpointerdown={startDrag}
	onpointerup={endDrag}
	onpointermove={hoverSkew}
	onpointerleave={resetHoverSkew}
	bind:this={record}
	role="img"
	aria-label="Vinyl record"
	class="rounded-full"
>
	<div
		class="aspect-square rounded-full bg-black flex justify-center items-center"
		style="transform: rotateZ({recordAngle}rad) perspective(1000px) rotateX({skewX}deg) rotateY({skewY}deg); transition: transform 0.1s ease-out; mask-image: radial-gradient(circle, transparent 0%, transparent 3.33%, black 3.33%, black 100%); -webkit-mask-image: radial-gradient(circle, transparent 0%, transparent 3.33%, black 3.33%, black 100%);"
	>
		<div class="absolute w-full h-1/100 bg-gray-900"></div>
		<div class="aspect-square rounded-full bg-[url('{img}')] bg-cover w-1/4 z-1"></div>
	</div>
</div>
