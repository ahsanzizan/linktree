import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

const getContentValue = async (key: string) => {
	const content = await prisma.content.findFirst({ where: { key } });
	return content?.value;
};

export const load = (async () => {
	const fullName = await getContentValue('fullName');
	const username = await getContentValue('username');
	const bio = await getContentValue('bio');
	const picture = await getContentValue('picture');

	const links = await prisma.link.findMany({});

	return {
		profile: {
			username: username,
			fullName: fullName,
			bio: bio,
			picture: picture
		},
		links
	};
}) satisfies PageServerLoad;
