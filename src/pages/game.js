import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pokemonData } from '../data/pokemondata.js';
import backgroundImg from '../assets/images/fightbg.png';

const initialHP = 100;

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.state?.mode || 'computer';

  const playerPokemon = location.state?.playerPokemon || pokemonData[0];
  const opponentPokemon = location.state?.opponentPokemon || pokemonData[1];

  const [playerHP, setPlayerHP] = useState(initialHP);
  const [opponentHP, setOpponentHP] = useState(initialHP);
  const [turn, setTurn] = useState('player');
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [lastAttack, setLastAttack] = useState({});

  const [playerAttackUses, setPlayerAttackUses] = useState(
    playerPokemon.attacks.map(() => 3)
  );
  const [opponentAttackUses, setOpponentAttackUses] = useState(
    opponentPokemon.attacks.map(() => 3)
  );

  // Core attack execution
  const executeAttack = (
    attacker,
    defender,
    attack,
    setDefenderHP,
    setUses,
    uses,
    idx
  ) => {
    if (uses[idx] === 0) return;

    // Accuracy check
    const hitChance = attack.accuracy || 90;
    if (Math.random() * 100 > hitChance) {
      setBattleLog(prev => [
        `${attacker} tried ${attack.name} but missed!`,
        ...prev,
      ].slice(0, 4));
      return;
    }

    // Critical hit check
    const isCrit = Math.random() < 0.1;
    let damage = attack.damage || Math.floor(Math.random() * 15) + 5;
    if (isCrit) damage = Math.floor(damage * 1.5);

    // Apply damage
    setDefenderHP(hp => {
      const newHP = Math.max(hp - damage, 0);
      if (newHP === 0) setWinner(attacker);
      return newHP;
    });

    // Reduce usage
    setUses(uses => uses.map((use, i) => (i === idx ? use - 1 : use)));

    // Log
    const logMessage = `${attacker} used ${attack.name}! ${isCrit ? 'Critical hit! ' : ''}Dealt ${damage} damage.`;
    setBattleLog(prev => [logMessage, ...prev].slice(0, 4));

    // Last attack
    setLastAttack({ attacker, type: attack.name, damage, crit: isCrit });
  };

  // Player attack
  const handleAttack = attackIdx => {
    if (winner || playerAttackUses[attackIdx] === 0 || turn !== 'player') return;

    const attack = playerPokemon.attacks[attackIdx];

    // Speed decides who acts first
    const playerFirst =
      playerPokemon.speed > opponentPokemon.speed ||
      (playerPokemon.speed === opponentPokemon.speed &&
        Math.random() < 0.5);

    if (playerFirst) {
      executeAttack(
        mode === 'computer' ? 'Player' : 'Player 1',
        mode === 'computer' ? 'Computer' : 'Player 2',
        attack,
        setOpponentHP,
        setPlayerAttackUses,
        playerAttackUses,
        attackIdx
      );
      setTurn(mode === 'computer' ? 'ai' : 'opponent');
    } else {
      setTurn(mode === 'computer' ? 'ai' : 'opponent');
    }
  };

  // Smarter AI attack
  useEffect(() => {
    if (winner) return;
    if (mode === 'computer' && turn === 'ai' && opponentHP > 0) {
      setTimeout(() => {
        // Choose usable attacks
        let available = opponentAttackUses
          .map((uses, idx) => (uses > 0 ? idx : null))
          .filter(idx => idx !== null);
        if (available.length === 0) available = [0];

        // Smart choice: try to finish the player if low HP
        let attackIdx;
        const killMove = available.find(
          idx => (opponentPokemon.attacks[idx].damage || 10) >= playerHP
        );
        if (killMove !== undefined) {
          attackIdx = killMove;
        } else {
          // Otherwise choose the strongest move
          let maxDamage = Math.max(
            ...available.map(idx => opponentPokemon.attacks[idx].damage || 10)
          );
          let strongMoves = available.filter(
            idx => (opponentPokemon.attacks[idx].damage || 10) === maxDamage
          );
          attackIdx =
            strongMoves[Math.floor(Math.random() * strongMoves.length)];
        }

        const attack = opponentPokemon.attacks[attackIdx];

        // Speed check
        const opponentFirst =
          opponentPokemon.speed > playerPokemon.speed ||
          (opponentPokemon.speed === playerPokemon.speed &&
            Math.random() < 0.5);

        if (opponentFirst) {
          executeAttack(
            'Computer',
            'Player',
            attack,
            setPlayerHP,
            setOpponentAttackUses,
            opponentAttackUses,
            attackIdx
          );
          setTurn('player');
        } else {
          // If player was supposed to act first but skipped, just go next turn
          executeAttack(
            'Computer',
            'Player',
            attack,
            setPlayerHP,
            setOpponentAttackUses,
            opponentAttackUses,
            attackIdx
          );
          setTurn('player');
        }
      }, 1500);
    }
  }, [turn, mode, winner, opponentHP, opponentAttackUses, opponentPokemon.attacks, playerHP, opponentPokemon.speed, playerPokemon.speed]);

  // Manual opponent attack for 1v1
  const handleOpponentAttack = attackIdx => {
    if (winner || mode !== '1v1' || turn !== 'opponent' || opponentAttackUses[attackIdx] === 0) return;

    const attack = opponentPokemon.attacks[attackIdx];

    executeAttack(
      'Player 2',
      'Player 1',
      attack,
      setPlayerHP,
      setOpponentAttackUses,
      opponentAttackUses,
      attackIdx
    );

    setTurn('player');
  };

  const handlePlayAgain = () => {
    setPlayerHP(initialHP);
    setOpponentHP(initialHP);
    setWinner(null);
    setTurn('player');
    setPlayerAttackUses(playerPokemon.attacks.map(() => 3));
    setOpponentAttackUses(opponentPokemon.attacks.map(() => 3));
    setBattleLog([]);
    setLastAttack({});
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const playerHPPercentage = (playerHP / initialHP) * 100;
  const opponentHPPercentage = (opponentHP / initialHP) * 100;
  const currentPlayerName = mode === 'computer' ? 'Player' : 'Player 1';
  const currentOpponentName = mode === 'computer' ? 'Computer' : 'Player 2';

  return (
    <div
      className="battle-container"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Turn Indicator */}
      <div className="turn-indicator">
        {!winner && (
          <>
            {turn === 'player' && `${currentPlayerName}'s turn`}
            {turn === 'opponent' && `${currentOpponentName}'s turn`}
            {turn === 'ai' && `${currentOpponentName}'s turn`}
          </>
        )}
        {winner && `${winner} Wins!`}
      </div>

      {/* Battle Log */}
      {battleLog.length > 0 && (
        <div className="battle-log-overlay">
          {battleLog.map((log, index) => (
            <div key={index} className="log-message">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Battle Field */}
      <div className="battle-field">
        {/* Player 1 Pokemon */}
        <div className="pokemon-area player1-area">
          <div className="pokemon-info-card">
            <div className="pokemon-name">
              {playerPokemon.name}({currentPlayerName})
            </div>
            <div className="hp-display">
              <span className="hp-percentage">
                {Math.round(playerHPPercentage)}%
              </span>
              <div className="hp-bar">
                <div
                  className="hp-fill"
                  style={{ width: `${playerHPPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="pokemon-sprite-container">
            <img
              src={playerPokemon.images?.player1 || playerPokemon.img}
              alt={playerPokemon.name}
              className="pokemon-sprite-game player1-sprite"
            />
          </div>
        </div>

        {/* Player 2 Pokemon */}
        <div className="pokemon-area player2-area">
          <div className="pokemon-info-card">
            <div className="pokemon-name">
              {opponentPokemon.name}({currentOpponentName})
            </div>
            <div className="hp-display">
              <span className="hp-percentage">
                {Math.round(opponentHPPercentage)}%
              </span>
              <div className="hp-bar">
                <div
                  className="hp-fill"
                  style={{ width: `${opponentHPPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="pokemon-sprite-container">
            <img
              src={opponentPokemon.images?.player2 || opponentPokemon.img}
              alt={opponentPokemon.name}
              className="pokemon-sprite-game player2-sprite"
            />
          </div>
        </div>
      </div>

      {/* Attack Panel */}
      {!winner && (
        <div className="attack-panel">
          <div className="attacks-header">
            {turn === 'player' && `${playerPokemon.name}'s Attacks`}
            {turn === 'opponent' && mode === '1v1' && `${opponentPokemon.name}'s Attacks`}
          </div>

          <div className="attacks-grid">
            {turn === 'player' &&
              playerPokemon.attacks.map((attack, idx) => (
                <button
                  key={idx}
                  className={`attack-button ${
                    playerAttackUses[idx] === 0 ? 'disabled' : ''
                  }`}
                  disabled={playerAttackUses[idx] === 0}
                  onClick={() => handleAttack(idx)}
                >
                  <div className="attack-name">
                    {attack.name} ({attack.damage || '??'})
                  </div>
                  <div className="attack-uses">
                    {playerAttackUses[idx]} left
                  </div>
                </button>
              ))}

            {turn === 'opponent' &&
              mode === '1v1' &&
              opponentPokemon.attacks.map((attack, idx) => (
                <button
                  key={idx}
                  className={`attack-button ${
                    opponentAttackUses[idx] === 0 ? 'disabled' : ''
                  }`}
                  disabled={opponentAttackUses[idx] === 0}
                  onClick={() => handleOpponentAttack(idx)}
                >
                  <div className="attack-name">
                    {attack.name} ({attack.damage || '??'})
                  </div>
                  <div className="attack-uses">
                    {opponentAttackUses[idx]} left
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Game Over Panel */}
      {winner && (
        <div className="game-over-panel">
          <div className="winner-announcement">{winner} Wins!</div>
          <div className="game-over-buttons">
            <button className="game-button play-again" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="game-button home-button" onClick={handleBackHome}>
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
