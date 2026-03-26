# Sleeper Manager

A modern web app to view and manage your fantasy football teams from Sleeper. Built with React.

## Features

- 🏈 **Search by username** - Find any Sleeper user and view their leagues
- 📊 **League Dashboard** - See all your leagues for the current season
- 🏆 **Standings** - View team records, points, and rankings within each league
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚡ **Real-time API** - Pulls live data directly from the Sleeper API

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or yarn)
- A Sleeper account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sleeper-manager.git
   cd sleeper-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in your browser**
   - The app will automatically open at `http://localhost:3000`
   - Enter your Sleeper username to load your data

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Usage

1. Enter your Sleeper username in the search box
2. Click "Search" or press Enter
3. The app will fetch:
   - Your user profile
   - All leagues you're in (2024 season)
   - Rosters and standings for each league
4. Click on any league to expand and see team details

## Project Structure

```
sleeper-manager/
├── src/
│   ├── App.jsx           # Main app component
│   ├── App.css           # Styles
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── public/
│   └── index.html        # HTML template
├── package.json          # Dependencies
└── README.md             # This file
```

## API Reference

The app uses the free [Sleeper API](https://docs.sleeper.app/) with these endpoints:

### Get User by Username
```
GET https://api.sleeper.app/v1/user/{username}
```
Returns: User object with `user_id`

### Get User's Leagues
```
GET https://api.sleeper.app/v1/user/{user_id}/leagues/nfl/{season}
```
Returns: Array of league objects

### Get League Rosters
```
GET https://api.sleeper.app/v1/league/{league_id}/rosters
```
Returns: Array of roster objects with standings

**Note:** No API key required for read-only operations!

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Lucide React** - Icons
- **CSS3** - Styling with gradients and animations

## Future Features

- [ ] Player roster details
- [ ] Trade history
- [ ] Draft board visualization
- [ ] League settings and scoring
- [ ] Multi-season view
- [ ] Export league data

## Troubleshooting

### "Username not found"
- Double-check your Sleeper username (case-sensitive)
- Make sure your username is correct on the Sleeper app

### "Could not fetch leagues"
- This usually means the API is temporarily unavailable
- Try again in a few moments
- Check that you're using the correct season (default: 2024)

### Port 3000 already in use
```bash
# Use a different port
npm start -- --port 3001
```

## Contributing

Found a bug or have a feature request? Feel free to:
1. Open an issue on GitHub
2. Fork the repo and submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes

## Resources

- [Sleeper API Docs](https://docs.sleeper.app/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

## Questions?

Feel free to open an issue or reach out with questions!

---

**Happy managing! 🏈**
