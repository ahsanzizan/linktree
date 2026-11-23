import { json } from '@sveltejs/kit';
import { links } from '../../../lib/profile';

export const prerender = false;

export const GET = () =>
	json(
		{ status: 200, message: 'Success', data: links },
		{ headers: { 'cache-control': 'public, max-age=300, s-maxage=31536000' } }
	);
