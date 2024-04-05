<script lang="ts">
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let displayUsername = true;

	function toggleDisplayUsername() {
		displayUsername = !displayUsername;
	}

	export let data: PageData;
</script>

<MetaTags
	title={data.profile.fullName}
	description={data.profile.bio}
	titleTemplate={`%s | ${data.profile.username}'s links'`}
/>

<JsonLd schema={[{ '@type': 'Person', name: data.profile.fullName }]} />

<main class="w-screen h-full bg-black px-5 py-12">
	<div class="w-full flex flex-col items-center">
		<img
			src={data.profile.picture}
			alt={data.profile.fullName}
			class="rounded-full w-1/3 md:w-full max-w-64 max-h-64 grayscale object-cover"
		/>
		<div class="block mt-4 text-center">
			<button
				class="text-xl leading-snug drop-shadow-glow md:text-3xl mb-1"
				on:click={toggleDisplayUsername}
			>
				{displayUsername ? `@${data.profile.username}` : data.profile.fullName}
			</button>
			<p class="text-neutral-400 text-sm md:text-base max-w-md">{data.profile.bio}</p>
		</div>
	</div>
</main>
