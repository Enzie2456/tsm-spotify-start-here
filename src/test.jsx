import './App.css';
import { Box } from '@mui/material'
import Dashboard from './components/Dashboard/Dashboard';
import Login from './pages/Login';
import { getAccessToken } from './utils/getAccessToken';
import { getAccessTokenFromStorage } from './utils/getAccessTokenFromStorage';
import { useEffect, useState } from 'react';
import {Routes, Route} from 'react-router-dom'

function App({spotifyApi}) {
    console.log(spotifyApi);
    const [token, setToken] = useState(getAccessTokenFromStorage());

    useEffect(() => {
        const accessToken = getAccessTokenFromStorage() || getAccessToken();
        
        if(accessToken) {
            setToken(accessToken);
            sessionStorage.setItem('spotifyToken', accessToken);
            window.location.hash = ''
        }
    }, []);

        return (
        <Box className="App">
            {token ? (
            <Dashboard spotifyApi={spotifyApi} />
            ) : (
            <Routes>
                <Route path="*" element={<Login />} />
            </Routes>
            )}
        </Box>
        );

}

export default App;

-----------------------------------
PKCE.JS

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

--------------------------------------

getAccessTokenFromStorage

export const getAccessTokenFromStorage = () => {
    const token = sessionStorage.getItem('spotifyToken');
    if (token !== null) {
        return token;
    } else {
        return false;
    }
};

--------------------------------------

getAccessToken

export const getAccessToken = () => {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    return params.get('access_token');
}

-----------------------


main.jsx 

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import SpotifyWebApi from 'spotify-web-api-node'
import { redirectURL } from './config/config'
import { ThemeProvider } from '@mui/system'
import { themeOptions } from './theme/material-theme'
import { BrowserRouter } from 'react-router-dom'
import SpotifyCallback from './pages/SpotifyCallback';

const spotifyApi = new SpotifyWebApi({
  clientId: import.meta.env.VITE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_APP_CLIENT_SECRET,
  redirectUri: redirectURL
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={themeOptions}>
       <App spotifyApi={spotifyApi}/>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
--------------------------

SpotifyCallback

// pages/SpotifyCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/pkce';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const runCallback = async (code) => {
      try {
        await getToken(code);
        // Redirect user after login
        navigate('/');
      } catch (error) {
        console.error('Error handling Spotify callback:', error);
      }
    };

    const code = new URLSearchParams(window.location.search).get('code');
    const codeVerifier = localStorage.getItem('code_verifier');

    if (!code || !codeVerifier) {
      console.warn('Missing code or code_verifier');
      return;
    }

    runCallback(code);
  }, []);

  return <p>Logging you in...</p>;
};

export default SpotifyCallback;

------------------------------------

Login.jsx

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

------------------------------------

Home.jsx

import {Box, Button} from '@mui/material'

const Home = () => {
    return <Box sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 5,
    }}>
        <img src="/TA-logo.png" alt="Techover" style={{ maxWidth: '50%', maxHeight: '50%'}} />
        <Button size='large' variant='contained' href='https://www.koda.techover.nu/courses/self-made'>Ansök nu!</Button>
    </Box>
}

export default Home;

----------------------------------

Dashboard

import {Box} from '@mui/material';
import {Routes, Route} from 'react-router-dom';
import Home from  '../../pages/Home';

const Dashboard = ({spotifyApi}) => {
    return <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex:1, overflowY: 'auto', display: 'flex'}}>
            <Routes>
                <Route path='/playlist/:id' element={<div>Playlist</div>} />
                <Route path='/library' element={<div>Library</div>} />
                <Route path='/' element={<Home />} />

            </Routes>
        </Box>
    </Box>
}

export default Dashboard;

-------------------------------------------------

