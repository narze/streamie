import { serialize } from 'cookie';

export async function post() {
	return {
		headers: {
			'Set-Cookie': [
				serialize('refresh_token', null, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					maxAge: 0
				})
			]
		},
		status: 200,
		body: 'Cleared refresh token'
	};
}
