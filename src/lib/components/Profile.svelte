<script lang="ts">
	interface ProfileProps {
		username?: string;
		fullName?: string;
		bio?: string;
		picture?: string;
	}

	export let profile: ProfileProps;
</script>

<div class="mb-8 flex w-full flex-col items-center">
	<img
		src={profile.picture}
		alt={profile.fullName}
		class="max-h-64 w-1/3 max-w-64 rounded-full object-cover grayscale md:w-full"
	/>
	<div class="mt-4 block text-center">
		<h3 class="mb-4 text-lg drop-shadow-glow md:text-xl">@{profile.username}</h3>
		<h1 class="mb-1 text-xl leading-snug drop-shadow-glow md:text-3xl">
			{profile.fullName}
		</h1>
		<p class="max-w-md text-sm text-neutral-400 md:text-base">{profile.bio}</p>
	</div>
</div>
