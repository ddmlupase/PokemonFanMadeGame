import './App.css';
import pokemonLogo from './assets/images/pokemon.png';
import backgroundImg from './assets/images/bg.png'; // Import your background image
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/select');
  };

  return (
    <div
      className="App pixel-bg"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <img src={pokemonLogo} className="pokemon pixel-logo" alt="Pokemon logo" />
      <div className="subtitle">DAYLIGHT CHRONICLES</div>
      <div className="btn-group">
      <button className="pixel-btn" onClick={() => navigate('/select')}>Play</button>
      <button className="pixel-btn">Credits</button>
      </div>
      <div className="fan-note">
        Fan made project - not affiliated with Nintendo or Game Freak
      </div>
      <img
        src="https://archives.bulbagarden.net/media/upload/4/41/Spr_3e_025.png"
        alt="Pikachu"
        className="pixel-pikachu"
      />
      <img
        src="https://archives.bulbagarden.net/media/upload/7/76/Spr_5b_001.png"
        alt="Bulbasaur"
        className="pixel-bulbasaur"
      />
      <img
        src="https://archives.bulbagarden.net/media/upload/0/0a/Spr_5b_004.png"
        alt="Charmander"
        className="pixel-charmander"
      />
      <img
        src="https://archives.bulbagarden.net/media/upload/5/59/Spr_5b_007.png"
        alt="Squirtle"
        className="pixel-squirtle"
      />
    </div>
  );
}

export default App;