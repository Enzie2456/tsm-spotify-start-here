const clientId = import.meta.env.VITE_CLIENT_ID;
const devURL = import.meta.env.VITE_LIVE_URL;

// utils/pkce.ts
export function generateCodeVerifier(length = 128) {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	let verifier = '';
	for (let i = 0; i < length; i++) {
		verifier += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return verifier;
}

export async function generateCodeChallenge(codeVerifier) {
	const data = new TextEncoder().encode(codeVerifier);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const string = btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	return string;
}

export const getToken = async (code) => {
	// stored in the previous step
	const codeVerifier = localStorage.getItem('code_verifier');
	const url = 'https://accounts.spotify.com/api/token';
	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: clientId,
			grant_type: 'authorization_code',
			code,
			redirect_uri: devURL,
			code_verifier: codeVerifier
		})
	};

	const body = await fetch(url, payload);
	const response = await body.json();

	console.log('Access Token:', response.access_token);

	if (response.access_token) {
		sessionStorage.setItem('spotifyToken', response.access_token);
	}
	return response.access_token;
};