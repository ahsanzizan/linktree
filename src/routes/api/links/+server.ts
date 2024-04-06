import prisma from '$lib/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const links = await prisma.link.findMany({});

		return new Response(JSON.stringify({ status: 200, message: 'Success', data: links }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ status: 500, message: 'Internal Server Error' }), {
			status: 500
		});
	}
};
