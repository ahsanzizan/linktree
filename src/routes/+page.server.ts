import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const fullName = await prisma.content.findFirst({ where: { key: 'fullName' } });
	const username = await prisma.content.findFirst({ where: { key: 'username' } });
	const bio = await prisma.content.findFirst({ where: { key: 'bio' } });
	const picture = await prisma.content.findFirst({ where: { key: 'picture' } });

	const links = await prisma.link.findMany({});

	return {
		profile: {
			username: username?.value,
			fullName: fullName?.value,
			bio: bio?.value,
			picture: picture?.value
		},
		links
	};
}) satisfies PageServerLoad;
