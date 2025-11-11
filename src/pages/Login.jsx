import React from 'react';
import { Box, Button } from '@mui/material';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
const clientId = import.meta.env.VITE_CLIENT_ID;
const devURL = import.meta.env.VITE_LIVE_URL;


export async function redirectToSpotifyAuth() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem('code_verifier', codeVerifier); // Save for later

	const scope = 'playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private app-remote-control streaming user-read-email user-read-private user-library-modify user-library-read user-top-read user-read-playback-position ugc-image-upload user-modify-playback-state user-read-playback-state user-read-currently-playing user-follow-modify user-follow-read user-read-recently-played'

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: devURL,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
    console.log('Redirect URI:', devURL);

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    

}


const Login = () => {
	/* Using ref to access API login, with redirect URI declared in config */
	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				height: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column'
			}}
		>
			<img
				src="/Spotify_Logo.png"
				alt="Techover spotify"
				style={{ marginBottom: 300, width: '70%', maxWidth: 500 }}
			/>
			<Button onClick={redirectToSpotifyAuth} color="primary" variant="contained" size="large">
				Login to Spotify
			</Button>
		</Box>
	);
};

export default Login;