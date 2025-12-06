<script lang="ts">
	let { img } = $props();

	let rotateX = $state(0);
	let rotateY = $state(0);
	let skewAmount = 1;

	function handleMouseMove(event: MouseEvent) {
		const card = event.currentTarget as HTMLElement;
		const rect = card.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const centreX = rect.width / 2;
		const centreY = rect.height / 2;

		rotateY = ((x - centreX) / centreX) * skewAmount;
		rotateX = ((centreY - y) / centreY) * skewAmount;
	}

	function handleMouseLeave(event: MouseEvent) {
		if ((event.buttons & 0b1) === 0) {
			rotateX = 0;
			rotateY = 0;
		}
	}

	function handleMouseDown(event: MouseEvent) {
		skewAmount = 10;
		handleMouseMove(event);
	}

	function handleMouseUp(event: MouseEvent) {
		skewAmount = 1;
		handleMouseMove(event);
		handleMouseLeave(event);
	}
</script>

<div
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	onpointerdown={handleMouseDown}
	onpointerup={handleMouseUp}
	role="img"
	aria-label="Vinyl record"
	class="rounded-full"
>
	<div
		class="aspect-square rounded-full bg-black flex justify-center items-center"
		style="transform: perspective(1000px) rotateX({rotateX}deg) rotateY({rotateY}deg); transition: transform 0.1s ease-out; mask-image: radial-gradient(circle, transparent 0%, transparent 3.33%, black 3.33%, black 100%); -webkit-mask-image: radial-gradient(circle, transparent 0%, transparent 3.33%, black 3.33%, black 100%);"
	>
		<div class="absolute w-full h-1/100 bg-gray-900"></div>
		<div class="aspect-square rounded-full bg-[url('{img}')] bg-cover w-1/4 z-1"></div>
	</div>
</div>
