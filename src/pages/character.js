import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pokemonData } from '../data/pokemondata.js'; 
import backgroundImg from '../assets/images/bg.png';

function Character() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.state?.mode || 'computer';

  const [selectedPokemon, setSelectedPokemon] = useState(0);
  const [playerPokemon, setPlayerPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);

  const handlePokemonSelect = (index) => {
    setSelectedPokemon(index);
  };

  const handleConfirmSelection = () => {
    const pokemon = pokemonData[selectedPokemon];
    
    if (currentPlayer === 1) {
      setPlayerPokemon(pokemon);
      if (mode === 'computer') {
        const randomOpponent = pokemonData[Math.floor(Math.random() * pokemonData.length)];
        setOpponentPokemon(randomOpponent);
      } else {
        setCurrentPlayer(2);
        setSelectedPokemon(0); // Reset selection for player 2
      }
    } else {
      setOpponentPokemon(pokemon);
    }
  };

  const handleStartGame = () => {
    navigate('/game', {
      state: {
        mode,
        playerPokemon,
        opponentPokemon,
      },
    });
  };

  const currentPokemon = pokemonData[selectedPokemon];
  const showingSelection = !playerPokemon || (mode === '1v1' && currentPlayer === 2 && !opponentPokemon);

  return (
    <div
      className="character-select-container"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {showingSelection && (
        <>
          <div className="selection-header">
            <h1 className="selection-title">
              Select your Pokemon
            </h1>
            <div className="player-indicator">
              (Player {currentPlayer})
            </div>
          </div>

          <div className="selection-layout">
            {/* Pokemon Grid */}
            <div className="pokemon-grid">
              {pokemonData.map((pokemon, index) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-card ${selectedPokemon === index ? 'selected' : ''}`}
                  onClick={() => handlePokemonSelect(index)}
                >
                  <img 
                    src={pokemon.images.selection} 
                    alt={pokemon.name}
                    className="pokemon-sprite"
                  />
                </div>
              ))}
            </div>

            {/* Center Pokemon Display */}
            <div className="center-display">
              <div className="pokemon-showcase">
                <img 
                  src={currentPokemon.images.selection} 
                  alt={currentPokemon.name}
                  className="showcase-sprite"
                />
              </div>
              <div className="pokemon-name-display">
                {currentPokemon.name}
              </div>
              <div className="pokemon-type">
                {currentPokemon.type}
              </div>
            </div>

            <div className="stats-panel">
              <div className="stats-header">
                <div className="stat-item">power: {currentPokemon.stats.power}</div>
                <div className="stat-item">skills: {currentPokemon.stats.skills}</div>
                <div className="stat-item">intelligence: {currentPokemon.stats.intelligence}</div>
                <div className="stat-item">physical damage: {currentPokemon.stats.physical}</div>
                <div className="stat-item">magic damage: {currentPokemon.stats.magic}</div>
              </div>
              

              <div className="pokemon-description">
                <div className="description-title">Description:</div>
                <div className="description-text">{currentPokemon.description}</div>
              </div>
            </div>
          </div>

          <button className="next-button" onClick={handleConfirmSelection}>
            Next
          </button>
        </>
      )}

      {playerPokemon && ((mode === 'computer' && opponentPokemon) || (mode === '1v1' && opponentPokemon)) && (
        <div className="ready-to-battle">
          <div className="battle-ready-title">Ready for Battle!</div>
          <div className="selected-pokemon-display">
            <div className="player-selection">
              <img src={playerPokemon.images.selection} alt={playerPokemon.name} className="ready-sprite" />
              <div className="pokemon-info">
                <div>Player 1: {playerPokemon.name}</div>
                <div className="pokemon-type-small">{playerPokemon.type}</div>
              </div>
            </div>
            <div className="vs-text">VS</div>
            <div className="opponent-selection">
              <img src={opponentPokemon.images.selection} alt={opponentPokemon.name} className="ready-sprite" />
              <div className="pokemon-info">
                <div>{mode === 'computer' ? 'Computer' : 'Player 2'}: {opponentPokemon.name}</div>
                <div className="pokemon-type-small">{opponentPokemon.type}</div>
              </div>
            </div>
          </div>
          <button className="start-battle-btn" onClick={handleStartGame}>
            Start Battle!
          </button>
        </div>
      )}
    </div>
  );
}

export default Character;