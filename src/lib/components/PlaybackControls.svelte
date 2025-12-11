<script lang="ts">
    import {
        IconContext,
        Play,
        Pause,
        Rewind,
        FastForward,
    } from 'phosphor-svelte';
    import type PlaybackController from './PlaybackController';

    let {
        controller,
        speed = $bindable(),
    }: { controller: PlaybackController; speed: number } = $props();

    function rewind() {
        speed = -4;
    }

    function fastForward() {
        speed = 4;
    }

    function play() {
        speed = 1;
    }

    function pause() {
        speed = 0;
    }

    function reset() {
        speed = 1;
    }
</script>

<div
    onpointerdown={() => controller.resumePlayback()}
    class="bg-gray-300 w-fit h-20 p-2 rounded-md"
>
    <IconContext values={{ size: '100%', weight: 'fill', color: 'silver' }}>
        <button onpointerdown={rewind} onpointerup={reset}>
            <Rewind />
        </button>
        <button onpointerdown={play}>
            <Play />
        </button>
        <button onpointerdown={pause}>
            <Pause />
        </button>
        <button onpointerdown={fastForward} onpointerup={reset}>
            <FastForward />
        </button>
    </IconContext>
</div>
<p>Speed: {speed}x</p>

<style>
    button {
        height: 100%;
        background-color: #333;
        border-radius: 20%;
        padding: 0.5rem;
    }
</style>
