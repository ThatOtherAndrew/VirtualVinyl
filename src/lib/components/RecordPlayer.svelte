<script lang="ts">
    import audio from '$lib/assets/epic_molehill.wav';
    import VinylRecord from '$lib/components/VinylRecord.svelte';
    import PlaybackControls from '$lib/components/PlaybackControls.svelte';
    import PlaybackController from './PlaybackController.ts';

    let speed = $state(0);
    const controller = new PlaybackController();

    $effect(() => {
        controller.loadFromUrl(audio);
    });
</script>

<div
    class="min-w-100 flex items-center flex-col gap-10 rounded-xl bg-gray-800 p-8 m-5"
>
    <VinylRecord {controller} bind:speed img="https://picsum.photos/200" />
    <PlaybackControls {controller} bind:speed />
</div>
