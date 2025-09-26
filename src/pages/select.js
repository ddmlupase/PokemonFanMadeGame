import { useNavigate } from 'react-router-dom';
import backgroundImg from '../assets/images/bg.png';

function Select() {
  const navigate = useNavigate();

  const handleSelect = (mode) => {
  navigate('/character', { state: { mode } });
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
      <div className="subtitle">Choose Game Mode</div>
      <div className="btn-group">
        <button className="pixel-btn" onClick={() => handleSelect('computer')}>VS Computer</button>
        <button className="pixel-btn" onClick={() => handleSelect('1v1')}>1v1</button>
      </div>
    </div>
  );
}

export default Select;