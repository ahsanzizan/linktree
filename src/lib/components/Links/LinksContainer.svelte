<script lang="ts">
	import type { Link } from '@prisma/client';
	import LinkItem from './LinkItem.svelte';

	export let links: Link[];
</script>

<div class="mx-auto w-full max-w-md">
	<div class="flex w-full flex-col items-center justify-center gap-5">
		{#each links.sort((a, b) => {
			// If both orders are null, maintain the original order
			if (a.order === null && b.order === null) {
				return 0;
			}
			// If only one order is null, place the null order at the end
			else if (a.order === null) {
				return 1;
			} else if (b.order === null) {
				return -1;
			}
			// If both orders are not null, sort based on their values
			else {
				return a.order - b.order;
			}
		}) as link}
			<LinkItem data={link} />
		{/each}
	</div>
</div>
