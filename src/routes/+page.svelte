<script lang="ts">
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import type { PageData } from './$types';
	import Profile from '$lib/components/Profile.svelte';
	import LinksContainer from '$lib/components/Links/LinksContainer.svelte';

	export let data: PageData;
</script>

<MetaTags
	title={data.profile.fullName}
	description={data.profile.bio}
	titleTemplate={`%s | ${data.profile.username}'s links`}
/>

<JsonLd schema={[{ '@type': 'Person', name: data.profile.fullName }]} />

<!-- UI elements -->
<Profile profile={data.profile} />
<LinksContainer links={data.links} />
