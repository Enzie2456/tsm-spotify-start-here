import { Box } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './components/Dashboard/Dashboard';
import SpotifyCallback from './pages/SpotifyCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home'
import Playlist from './pages/Playlist'
import Library from './pages/Library'


function App({ spotifyApi }) {
	return (
		<Box className="App">
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/callback" element={<SpotifyCallback />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard spotifyApi={spotifyApi} />
						</ProtectedRoute>
					}
				>
					{/* ✅ Nested under /dashboard */}
					<Route path="" element={<Home />} />
					<Route path="playlist/:id" element={<Playlist spotifyApi={spotifyApi} />} />
					<Route path="library" element={<Library spotifyApi={spotifyApi} />} />
				</Route>

				{/* ✅ Redirect unknown routes */}
				<Route path="*" element={<Navigate to="/dashboard" />} />
			</Routes>
		</Box>
	);
}

export default App;