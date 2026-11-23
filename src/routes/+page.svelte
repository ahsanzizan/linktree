<script lang="ts">
	import { onMount } from 'svelte';
	import { links, profile } from '../lib/profile';
	import { createSignalField, type SignalField } from '../lib/signal-field';
	import '../app.css';

	const MAGNET_PX = 5;

	let canvas: HTMLCanvasElement;
	let field: SignalField | null = null;
	let fieldVisible = $state(false);
	let magnetic = false;

	const title = `${profile.fullName} | ${profile.username}'s links`;
	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: profile.fullName,
		alternateName: profile.username,
		description: profile.bio,
		image: profile.pictureSource,
		sameAs: links.filter((link) => link.url.startsWith('https://')).map((link) => link.url)
	}).replaceAll('<', '\\u003c');

	const destination = (url: string) =>
		url.startsWith('mailto:')
			? url.slice('mailto:'.length)
			: new URL(url).hostname.replace(/^www\./, '');

	onMount(() => {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		magnetic = !reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches;
		try {
			field = createSignalField(canvas, {
				animate: !reducedMotion,
				onFirstFrame: () => (fieldVisible = true)
			});
		} catch (error) {
			console.error(error);
		}
		return () => field?.destroy();
	});

	function rippleFrom(event: PointerEvent | FocusEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		field?.ripple(rect.left + rect.width / 2, rect.top + rect.height / 2);
	}

	function attract(event: PointerEvent) {
		if (!magnetic) return;
		const link = event.currentTarget as HTMLElement;
		const rect = link.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
		const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
		link.style.setProperty('--pull-x', `${x * MAGNET_PX}px`);
		link.style.setProperty('--pull-y', `${y * MAGNET_PX * 0.6}px`);
	}

	function release(event: PointerEvent) {
		const link = event.currentTarget as HTMLElement;
		link.style.removeProperty('--pull-x');
		link.style.removeProperty('--pull-y');
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={profile.bio} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={profile.bio} />
	<meta property="og:image" content={profile.pictureSource} />
	<meta name="twitter:card" content="summary" />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<canvas class="field" class:visible={fieldVisible} bind:this={canvas} aria-hidden="true"></canvas>

<main>
	<header>
		<img
			src={profile.picture}
			alt={profile.fullName}
			width="176"
			height="176"
			fetchpriority="high"
		/>
		<h1>{profile.fullName}</h1>
		<p class="handle">@{profile.username}</p>
		<p class="bio">{profile.bio}</p>
	</header>

	<ul>
		{#each links as link (link.id)}
			{@const external = !link.url.startsWith('mailto:')}
			<li>
				<a
					href={link.url}
					target={external ? '_blank' : undefined}
					rel={external ? 'noopener' : undefined}
					onpointerenter={rippleFrom}
					onfocus={rippleFrom}
					onpointermove={attract}
					onpointerleave={release}
				>
					<span class="title">{link.title}</span>
					<span class="destination">
						{destination(link.url)}{#if external}<span class="sr-only">
								(opens in a new tab)
							</span>{/if}
					</span>
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
					</svg>
				</a>
			</li>
		{/each}
	</ul>
</main>

<style>
	.field {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 0;
		transition: opacity 1.6s var(--ease-out);
	}

	.field.visible {
		opacity: 1;
	}

	main {
		position: relative;
		width: min(100%, 27rem);
		margin-inline: auto;
		padding: clamp(3rem, 10vh, 6rem) 1rem 4rem;
	}

	header {
		display: grid;
		justify-items: center;
		text-align: center;
		margin-bottom: 2.75rem;
	}

	img {
		width: clamp(7.5rem, 30vw, 11rem);
		height: auto;
		aspect-ratio: 1;
		border-radius: 50%;
		margin-bottom: 1.5rem;
		box-shadow:
			0 0 0 1px var(--line),
			0 1.25rem 3rem -1rem rgb(255 255 255 / 0.14);
	}

	h1 {
		margin: 0;
		font-size: clamp(1.6rem, 6vw, 2.25rem);
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.handle {
		margin: 0.4rem 0 0.9rem;
		color: var(--muted);
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.bio {
		margin: 0;
		max-width: 32ch;
		color: var(--soft);
		font-size: 1rem;
		line-height: 1.55;
		text-wrap: pretty;
	}

	ul {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		--pull-x: 0px;
		--pull-y: 0px;
		display: grid;
		grid-template-columns: 1fr auto 1rem;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.375rem;
		padding: 0 1.25rem 0 1.5rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(0 0 0 / 0.72);
		color: var(--ink);
		text-decoration: none;
		transform: translate(var(--pull-x), var(--pull-y));
		transition:
			transform 0.5s var(--ease-out),
			background-color 0.35s var(--ease-out),
			border-color 0.35s var(--ease-out),
			color 0.35s var(--ease-out);
	}

	a:hover {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--paper);
		transition-duration: 0.18s, 0.35s, 0.35s, 0.35s;
	}

	a:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 3px;
	}

	a:active {
		transform: translate(var(--pull-x), var(--pull-y)) scale(0.985);
	}

	.title {
		font-size: 1.0625rem;
		font-weight: 500;
		letter-spacing: -0.005em;
	}

	.destination {
		overflow: hidden;
		max-width: 11rem;
		color: var(--muted);
		font-size: 0.8125rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color 0.35s var(--ease-out);
	}

	a:hover .destination {
		color: #525252;
	}

	svg {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 0.35s var(--ease-out);
	}

	a:hover svg {
		transform: translate(2px, -2px);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 380px) {
		.destination {
			display: none;
		}
		a {
			grid-template-columns: 1fr 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.field,
		a,
		svg,
		.destination {
			transition: none;
		}
	}
</style>
