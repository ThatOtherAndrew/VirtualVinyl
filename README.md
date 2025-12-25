# Virtual Vinyl

A [Svelte](https://svelte.dev/) and [Tailwind](https://tailwindcss.com/) library for analogue vinyl record emulation with an interactive UI component.

## Usage

> [!TIP]
> For a simple example project using this library, check out [Jockey](https://github.com/ThatOtherAndrew/Jockey) ([live demo](https://thatotherandrew.github.io/Jockey/)).

Install the package via `npm` or another package manager of choice:

```shell
npm i github:ThatOtherAndrew/VirtualVinyl
```

> [!WARNING]
> If you are using `bun`, ensure that the postinstall script is run:
> ```shell
> bun pm trust virtual-vinyl
> ```

Include in your TailwindCSS file (e.g. `/src/routes/layout.css` if using [SvelteKit](https://svelte.dev/docs/kit/introduction)):

```css
/* relative path to node_modules/virtual-vinyl */
@source '../../node_modules/virtual-vinyl';
```

Import the `VinylRecord` component, and `PlaybackController` class. A minimal example is shown below:

```svelte
<script>
    import { VinylRecord, PlaybackController } from 'virtual-vinyl';

    let speed = $state(0);
    const controller = new PlaybackController();
    const audioUrl = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Ars_Niemo_-_Small_Talk_Build_IV.ogg';

    $effect(() => {
        controller.loadFromUrl(audioUrl);
    });
    
    function playPause() {
        speed = speed === 1 ? 0 : 1;
    }
</script>

<VinylRecord {controller} bind:speed img="https://picsum.photos/200" />
<button onclick={playPause}>Play/Pause</button>
```
