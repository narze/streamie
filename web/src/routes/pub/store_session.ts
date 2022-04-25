import { serialize } from 'cookie';
import type { RequestHandler } from '@sveltejs/kit';

export const post: RequestHandler = async ({ request }) => {
	const params = await request.json();

	return {
		headers: {
			'Set-Cookie': [
				serialize('access_token', params.access_token, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					expires: new Date(params.access_token_expires_in)
				}),
				serialize('refresh_token', params.refresh_token, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					expires: new Date(params.refresh_token_expires_in)
				})
			]
		},
		status: 203,
		body: 'OK' // Show blank page before refresh
	};
};
