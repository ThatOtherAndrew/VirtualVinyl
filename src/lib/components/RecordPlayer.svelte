<script>
    import audio from '$lib/assets/epic_molehill.wav';
    import Record from '$lib/components/Record.svelte';
    import PlaybackControls from '$lib/components/PlaybackControls.svelte';

    let speed = $state(0);
</script>

<div>
    <Record bind:speed img="https://picsum.photos/200" {audio} />
    <PlaybackControls bind:speed />
</div>
