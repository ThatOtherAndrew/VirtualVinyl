<script lang="ts">
    import type PlaybackController from './PlaybackController.ts';

    let {
        controller,
        speed = $bindable(),
        img,
    }: {
        controller: PlaybackController;
        speed: number;
        img: string;
    } = $props();

    const HOVER_SKEW_STRENGTH = 1.5;
    const DRAG_SKEW_STRENGTH = 5;

    let record: HTMLDivElement;
    let skewX = $state(0);
    let skewY = $state(0);
    let recordPosition = $state(0);
    let isDragging = $state(false);
    let dragDelta = $state(0);
    let lastDragAngle = $state(0);
    let lastTick: number;

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
        isDragging = true;
        dragDelta = 0;
        lastDragAngle = getPointerEventMeasurements(event).angle;

        // attach listeners for spinning the record
        window.addEventListener('pointermove', drag);
        window.addEventListener('pointerup', endDrag, { once: true });

        // resume audio context if needed
        controller.resumePlayback();

        drag(event);
    }

    function drag(event: PointerEvent) {
        const { dx, dy, distance, angle } = getPointerEventMeasurements(event);

        // Calculate the change in angle, handling wrap-around
        let deltaAngle = angle - lastDragAngle;

        // Unwrap: if the difference is > π, we crossed the boundary
        if (deltaAngle > Math.PI) {
            deltaAngle -= 2 * Math.PI;
        } else if (deltaAngle < -Math.PI) {
            deltaAngle += 2 * Math.PI;
        }

        // Accumulate the change (allows continuous rotation beyond [-π, π])
        dragDelta += deltaAngle;
        recordPosition += deltaAngle;
        lastDragAngle = angle;

        // exaggerated skew
        if (distance > 0) {
            skewY = (dx / distance) * DRAG_SKEW_STRENGTH;
            skewX = -(dy / distance) * DRAG_SKEW_STRENGTH;
        } else {
            skewX = 0;
            skewY = 0;
        }
    }

    function endDrag(event: PointerEvent) {
        isDragging = false;
        hoverSkew(event);
        window.removeEventListener('pointermove', drag);
    }

    function tick() {
        const now = performance.now();
        const deltaTime = now - lastTick;
        lastTick = now;

        if (!isDragging) {
            recordPosition += deltaTime * (speed / 500);
        }

        controller.scrubTo(recordPosition, deltaTime);
    }

    $effect(() => {
        lastTick = performance.now();
        setInterval(() => tick(), 10);
    });
</script>

<div class="bg-red-500 contain-layout">
    <div
        onpointerdown={startDrag}
        onpointerup={endDrag}
        onpointermove={hoverSkew}
        onpointerleave={resetHoverSkew}
        bind:this={record}
        role="img"
        aria-label="Vinyl record"
        class="rounded-full relative touch-none"
    >
        <div
            class="skewable pointer-events-none"
            style="transform: perspective(1000px) rotateX({skewX}deg) rotateY({skewY}deg);"
        >
            <!-- Record surface (rotates) -->
            <div
                class="surface aspect-square rounded-full bg-black flex justify-center items-center"
                style="transform: rotateZ({recordPosition}rad);"
            >
                <!-- Line to help show orientation -->
                <div class="absolute w-full h-1/50 bg-gray-900"></div>
                <!-- Record label -->
                <div
                    class="aspect-square rounded-full bg-cover w-1/4 z-1"
                    style="background-image: url('{img}')"
                ></div>
            </div>

            <!-- Groove light reflection (fixed to page, follows skew only) -->
            <div
                class="grooves absolute inset-0 rounded-full pointer-events-none"
            ></div>
        </div>
    </div>
</div>

<!-- Debug info -->
<p>recordAngle: {recordPosition}</p>
{#if isDragging}
    <p>dragDelta: {dragDelta}</p>
{/if}

<style>
    .skewable {
        transition: transform 0.1s ease-out;
    }

    .surface {
        mask-image: radial-gradient(
            circle,
            transparent 0%,
            transparent 3.33%,
            black 3.33%,
            black 100%
        );
        -webkit-mask-image: radial-gradient(
            circle,
            transparent 0%,
            transparent 3.33%,
            black 3.33%,
            black 100%
        );
    }

    .grooves {
        background: repeating-radial-gradient(
            circle at center,
            transparent 0px,
            transparent 6px,
            rgba(255, 255, 255, 0.15) 6px,
            rgba(255, 255, 255, 0.15) 8px
        );
        mask-image:
            radial-gradient(
                circle,
                transparent 0%,
                transparent 12.5%,
                black 12.5%,
                black 50%
            ),
            linear-gradient(135deg, black 0%, black 20%, transparent 50%);
        mask-composite: intersect;
    }
</style>
