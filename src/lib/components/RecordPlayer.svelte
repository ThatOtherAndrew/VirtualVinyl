<script lang="ts">
    import audio from '$lib/assets/epic_molehill.wav';
    import Record from '$lib/components/Record.svelte';
    import PlaybackControls from '$lib/components/PlaybackControls.svelte';
    import PlaybackController from './PlaybackController.ts';

    let speed = $state(0);
    const controller = new PlaybackController();

    $effect(() => {
        controller.loadFromUrl(audio);
    });
</script>

<div>
    <Record {controller} bind:speed img="https://picsum.photos/200" />
    <PlaybackControls {controller} bind:speed />
</div>
