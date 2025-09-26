import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pokemonData } from '../data/pokemondata.js';
import backgroundImg from '../assets/images/fightbg.png';

const initialHP = 100;

// Enhanced battle text animations and effects
const BattleText = ({ text, isVisible, type = 'normal' }) => {
  if (!isVisible) return null;
  
  return (
    <div className={`battle-text-animation ${type}`}>
      {text}
    </div>
  );
};

// Damage number animation component
const DamageNumber = ({ damage, isVisible, isCrit, position }) => {
  if (!isVisible) return null;
  
  return (
    <div 
      className={`damage-number ${isCrit ? 'critical' : ''}`}
      style={{ 
        left: position.x, 
        top: position.y,
        position: 'absolute',
        zIndex: 1000
      }}
    >
      {isCrit && '★ '}{damage}{isCrit && ' ★'}
    </div>
  );
};

// Screen shake effect
const useScreenShake = () => {
  const [isShaking, setIsShaking] = useState(false);
  
  const shake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);
  
  return [isShaking, shake];
};

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.state?.mode || 'computer';
  const gameContainerRef = useRef(null);

  const playerPokemon = location.state?.playerPokemon || pokemonData[0];
  const opponentPokemon = location.state?.opponentPokemon || pokemonData[1];

  // Core game state
  const [playerHP, setPlayerHP] = useState(initialHP);
  const [opponentHP, setOpponentHP] = useState(initialHP);
  const [turn, setTurn] = useState('player');
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isShaking, shake] = useScreenShake();

  // Enhanced state for animations and effects
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerTakingDamage, setPlayerTakingDamage] = useState(false);
  const [opponentTakingDamage, setOpponentTakingDamage] = useState(false);
  const [showBattleText, setShowBattleText] = useState(false);
  const [battleText, setBattleText] = useState('');
  const [battleTextType, setBattleTextType] = useState('normal');
  const [showDamage, setShowDamage] = useState({ show: false, damage: 0, isCrit: false, position: { x: 0, y: 0 } });
  const [turnTimer, setTurnTimer] = useState(30);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [comboCount, setComboCount] = useState(0);
  const [playerStatus, setPlayerStatus] = useState(null); // poison, burn, etc.
  const [opponentStatus, setOpponentStatus] = useState(null);
  const [weatherEffect, setWeatherEffect] = useState(null); // rain, sun, etc.

  const [playerAttackUses, setPlayerAttackUses] = useState(
    playerPokemon.attacks.map(() => 3)
  );
  const [opponentAttackUses, setOpponentAttackUses] = useState(
    opponentPokemon.attacks.map(() => 3)
  );

  // Sound effects (mock functions - replace with actual audio)
  const playSound = useCallback((soundName) => {
    console.log(`Playing sound: ${soundName}`);
    // You can replace this with actual audio implementation
    // const audio = new Audio(`/sounds/${soundName}.mp3`);
    // audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  // Enhanced battle text display
  const displayBattleText = useCallback((text, type = 'normal', duration = 2000) => {
    setBattleText(text);
    setBattleTextType(type);
    setShowBattleText(true);
    playSound(type === 'critical' ? 'critical_hit' : 'battle_text');
    
    setTimeout(() => {
      setShowBattleText(false);
    }, duration);
  }, [playSound]);

  // Enhanced damage display
  const displayDamage = useCallback((damage, isCrit, targetElement) => {
    const rect = targetElement?.getBoundingClientRect();
    const containerRect = gameContainerRef.current?.getBoundingClientRect();
    
    if (rect && containerRect) {
      setShowDamage({
        show: true,
        damage,
        isCrit,
        position: {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top
        }
      });
      
      setTimeout(() => {
        setShowDamage(prev => ({ ...prev, show: false }));
      }, 1500);
    }
  }, []);

  // Status effect application
  const applyStatusEffect = useCallback((target, effect, duration = 3) => {
    const setter = target === 'player' ? setPlayerStatus : setOpponentStatus;
    setter({ type: effect, duration });
    
    displayBattleText(
      `${target === 'player' ? playerPokemon.name : opponentPokemon.name} is ${effect}!`,
      'status'
    );
  }, [displayBattleText, playerPokemon.name, opponentPokemon.name]);

  // Enhanced attack execution with animations
  const executeAttack = useCallback(async (
    attacker,
    defender,
    attack,
    setDefenderHP,
    setUses,
    uses,
    idx,
    isPlayerAttacker = true
  ) => {
    if (uses[idx] === 0) return;

    // Start attack animation
    const setAttacking = isPlayerAttacker ? setPlayerAttacking : setOpponentAttacking;
    setAttacking(true);
    
    playSound('attack_start');
    displayBattleText(`${attacker} used ${attack.name}!`, 'attack');

    // Wait for attack animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Accuracy check with dramatic effect
    const hitChance = attack.accuracy || 90;
    const hitRoll = Math.random() * 100;
    
    if (hitRoll > hitChance) {
      setAttacking(false);
      playSound('miss');
      displayBattleText(`${attacker} missed!`, 'miss');
      setBattleLog(prev => [`${attacker} tried ${attack.name} but missed!`, ...prev].slice(0, 4));
      return;
    }

    // Calculate damage with enhanced mechanics
    let baseDamage = attack.damage || Math.floor(Math.random() * 15) + 5;
    
    // Type effectiveness (mock system)
    let effectiveness = 1;
    if (attack.type === 'fire' && defender.includes('Bulbasaur')) effectiveness = 2;
    if (attack.type === 'water' && defender.includes('Charmander')) effectiveness = 2;
    if (attack.type === 'grass' && defender.includes('Squirtle')) effectiveness = 2;
    
    // Critical hit check (higher chance for combos)
    const critChance = 0.1 + (comboCount * 0.05);
    const isCrit = Math.random() < critChance;
    
    let finalDamage = Math.floor(baseDamage * effectiveness);
    if (isCrit) {
      finalDamage = Math.floor(finalDamage * 1.8);
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(0);
    }

    // Weather effects
    if (weatherEffect === 'rain' && attack.type === 'water') finalDamage = Math.floor(finalDamage * 1.3);
    if (weatherEffect === 'sun' && attack.type === 'fire') finalDamage = Math.floor(finalDamage * 1.3);

    // Apply damage with screen shake
    shake();
    playSound(isCrit ? 'critical_hit' : 'hit');
    
    const setTakingDamage = isPlayerAttacker ? setOpponentTakingDamage : setPlayerTakingDamage;
    setTakingDamage(true);

    // Display damage number
    const targetElement = document.querySelector(isPlayerAttacker ? '.player2-sprite' : '.player1-sprite');
    displayDamage(finalDamage, isCrit, targetElement);

    setDefenderHP(hp => {
      const newHP = Math.max(hp - finalDamage, 0);
      if (newHP === 0) {
        setTimeout(() => {
          setWinner(attacker);
          playSound('victory');
        }, 1000);
      }
      return newHP;
    });

    // Status effect chances
    if (attack.name.includes('burn') && Math.random() < 0.3) {
      applyStatusEffect(isPlayerAttacker ? 'opponent' : 'player', 'burned');
    }
    if (attack.name.includes('poison') && Math.random() < 0.25) {
      applyStatusEffect(isPlayerAttacker ? 'opponent' : 'player', 'poisoned');
    }

    // Reduce usage
    setUses(uses => uses.map((use, i) => (i === idx ? use - 1 : use)));

    // Enhanced battle log
    let logMessage = `${attacker} used ${attack.name}!`;
    if (effectiveness > 1) logMessage += ' It\'s super effective!';
    if (effectiveness < 1) logMessage += ' It\'s not very effective...';
    if (isCrit) logMessage += ' Critical hit!';
    logMessage += ` Dealt ${finalDamage} damage.`;

    setBattleLog(prev => [logMessage, ...prev].slice(0, 4));

    // Display effectiveness text
    if (effectiveness > 1) {
      displayBattleText('Super Effective!', 'super_effective');
    } else if (effectiveness < 1) {
      displayBattleText('Not Very Effective...', 'not_effective');
    } else if (isCrit) {
      displayBattleText('Critical Hit!', 'critical');
    }

    // End animations
    setTimeout(() => {
      setAttacking(false);
      setTakingDamage(false);
    }, 1000);

    setTurnTimer(30); // Reset turn timer
  }, [
    playSound, 
    displayBattleText, 
    applyStatusEffect, 
    comboCount, 
    weatherEffect, 
    shake, 
    displayDamage
  ]);

  // Enhanced player attack with visual feedback
  const handleAttack = useCallback(async (attackIdx) => {
    if (winner || playerAttackUses[attackIdx] === 0 || turn !== 'player') return;

    const attack = playerPokemon.attacks[attackIdx];
    setIsPlayerTurn(false);

    await executeAttack(
      mode === 'computer' ? 'Player' : 'Player 1',
      mode === 'computer' ? 'Computer' : 'Player 2',
      attack,
      setOpponentHP,
      setPlayerAttackUses,
      playerAttackUses,
      attackIdx,
      true
    );

    // Weather change chance
    if (Math.random() < 0.1) {
      const weathers = ['rain', 'sun', 'sandstorm', null];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeatherEffect(newWeather);
      if (newWeather) {
        displayBattleText(`${newWeather.charAt(0).toUpperCase() + newWeather.slice(1)} started!`, 'weather');
      }
    }

    setTimeout(() => {
      setTurn(mode === 'computer' ? 'ai' : 'opponent');
      setIsPlayerTurn(false);
    }, 2000);
  }, [
    winner,
    playerAttackUses,
    turn,
    playerPokemon.attacks,
    mode,
    executeAttack,
    displayBattleText
  ]);

  // Manual opponent attack for 1v1 mode
  const handleOpponentAttack = useCallback(async (attackIdx) => {
    if (winner || mode !== '1v1' || turn !== 'opponent' || opponentAttackUses[attackIdx] === 0) return;

    const attack = opponentPokemon.attacks[attackIdx];
    setIsPlayerTurn(false);

    await executeAttack(
      'Player 2',
      'Player 1',
      attack,
      setPlayerHP,
      setOpponentAttackUses,
      opponentAttackUses,
      attackIdx,
      false
    );

    // Weather change chance
    if (Math.random() < 0.1) {
      const weathers = ['rain', 'sun', 'sandstorm', null];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeatherEffect(newWeather);
      if (newWeather) {
        displayBattleText(`${newWeather.charAt(0).toUpperCase() + newWeather.slice(1)} started!`, 'weather');
      }
    }

    setTimeout(() => {
      setTurn('player');
      setIsPlayerTurn(true);
      setTurnTimer(30);
    }, 2000);
  }, [
    winner,
    mode,
    turn,
    opponentAttackUses,
    opponentPokemon.attacks,
    executeAttack,
    displayBattleText
  ]);

  // Turn timer effect
  useEffect(() => {
    if (winner || turn === 'ai') return;
    
    const timer = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          // Auto-select random available attack if time runs out
          if (turn === 'player') {
            const availableAttacks = playerAttackUses
              .map((uses, idx) => uses > 0 ? idx : null)
              .filter(idx => idx !== null);
            if (availableAttacks.length > 0) {
              const randomAttack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
              handleAttack(randomAttack);
            }
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, winner, playerAttackUses, handleAttack]);

  // Enhanced AI with more personality
  useEffect(() => {
    if (winner || mode !== 'computer' || turn !== 'ai' || opponentHP <= 0) return;

    const aiDelay = Math.random() * 2000 + 1000; // Random thinking time

    const aiTurn = setTimeout(async () => {
      let available = opponentAttackUses
        .map((uses, idx) => (uses > 0 ? idx : null))
        .filter(idx => idx !== null);
      if (available.length === 0) available = [0];

      let attackIdx;
      
      // Smart AI decision making
      const playerHPPercent = playerHP / initialHP;
      const opponentHPPercent = opponentHP / initialHP;
      
      if (playerHPPercent < 0.3) {
        // Try to finish the player if they're low
        const killMove = available.find(
          idx => (opponentPokemon.attacks[idx].damage || 10) >= playerHP
        );
        attackIdx = killMove !== undefined ? killMove : available[0];
      } else if (opponentHPPercent < 0.3) {
        // Defensive play if AI is low
        const defensiveMove = available.find(idx => 
          opponentPokemon.attacks[idx].name.includes('defense') || 
          opponentPokemon.attacks[idx].damage === 0
        );
        attackIdx = defensiveMove !== undefined ? defensiveMove : available[0];
      } else {
        // Balanced strategy
        const strongMoves = available.filter(
          idx => (opponentPokemon.attacks[idx].damage || 10) > 25
        );
        attackIdx = strongMoves.length > 0 
          ? strongMoves[Math.floor(Math.random() * strongMoves.length)]
          : available[Math.floor(Math.random() * available.length)];
      }

      const attack = opponentPokemon.attacks[attackIdx];

      await executeAttack(
        'Computer',
        'Player',
        attack,
        setPlayerHP,
        setOpponentAttackUses,
        opponentAttackUses,
        attackIdx,
        false
      );

      setTimeout(() => {
        setTurn('player');
        setIsPlayerTurn(true);
        setTurnTimer(30);
      }, 2000);
    }, aiDelay);

    return () => clearTimeout(aiTurn);
  }, [
    turn, 
    mode, 
    winner, 
    opponentHP, 
    opponentAttackUses, 
    playerHP, 
    opponentPokemon.attacks, 
    executeAttack
  ]);

  // Status effects processing
  useEffect(() => {
    if (playerStatus && playerStatus.duration > 0) {
      const damage = Math.floor(Math.random() * 8) + 3;
      setPlayerHP(hp => Math.max(hp - damage, 0));
      displayBattleText(`${playerPokemon.name} takes ${damage} damage from ${playerStatus.type}!`, 'status');
      setPlayerStatus(prev => ({ ...prev, duration: prev.duration - 1 }));
    } else {
      setPlayerStatus(null);
    }

    if (opponentStatus && opponentStatus.duration > 0) {
      const damage = Math.floor(Math.random() * 8) + 3;
      setOpponentHP(hp => Math.max(hp - damage, 0));
      displayBattleText(`${opponentPokemon.name} takes ${damage} damage from ${opponentStatus.type}!`, 'status');
      setOpponentStatus(prev => ({ ...prev, duration: prev.duration - 1 }));
    } else {
      setOpponentStatus(null);
    }
  }, [turn, playerStatus, opponentStatus, playerPokemon.name, opponentPokemon.name, displayBattleText]);

  const handlePlayAgain = useCallback(() => {
    // Reset all state
    setPlayerHP(initialHP);
    setOpponentHP(initialHP);
    setWinner(null);
    setTurn('player');
    setPlayerAttackUses(playerPokemon.attacks.map(() => 3));
    setOpponentAttackUses(opponentPokemon.attacks.map(() => 3));
    setBattleLog([]);
    setPlayerAttacking(false);
    setOpponentAttacking(false);
    setPlayerTakingDamage(false);
    setOpponentTakingDamage(false);
    setShowBattleText(false);
    setComboCount(0);
    setPlayerStatus(null);
    setOpponentStatus(null);
    setWeatherEffect(null);
    setTurnTimer(30);
    setIsPlayerTurn(true);
  }, [playerPokemon.attacks, opponentPokemon.attacks]);

  const handleBackHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const playerHPPercentage = (playerHP / initialHP) * 100;
  const opponentHPPercentage = (opponentHP / initialHP) * 100;
  const currentPlayerName = mode === 'computer' ? 'Player' : 'Player 1';
  const currentOpponentName = mode === 'computer' ? 'Computer' : 'Player 2';

  return (
    <div
      ref={gameContainerRef}
      className={`battle-container ${isShaking ? 'screen-shake' : ''} ${weatherEffect ? `weather-${weatherEffect}` : ''}`}
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Enhanced Turn Indicator with Timer */}
      <div className="turn-indicator enhanced">
        {!winner && (
          <div className="turn-info">
            <div className="turn-text">
              {turn === 'player' && `${currentPlayerName}'s Turn`}
              {turn === 'opponent' && `${currentOpponentName}'s Turn`}
              {turn === 'ai' && `${currentOpponentName} is thinking...`}
            </div>
            {turn !== 'ai' && (
              <div className={`turn-timer ${turnTimer <= 10 ? 'urgent' : ''}`}>
                {turnTimer}s
              </div>
            )}
          </div>
        )}
        {winner && (
          <div className="winner-text animated">
             {winner} Wins! 
          </div>
        )}
      </div>

      {/* Weather Effect Display */}
      {weatherEffect && (
        <div className="weather-indicator">
          {weatherEffect === 'rain' && '🌧️ Rain'}
          {weatherEffect === 'sun' && '☀️ Harsh Sunlight'}
          {weatherEffect === 'sandstorm' && '🌪️ Sandstorm'}
        </div>
      )}

      {/* Combo Counter */}
      {comboCount > 1 && (
        <div className="combo-counter">
          {comboCount}x COMBO!
        </div>
      )}

      {/* Battle Text Animation */}
      <BattleText 
        text={battleText} 
        isVisible={showBattleText} 
        type={battleTextType}
      />

      {/* Damage Number */}
      <DamageNumber 
        damage={showDamage.damage}
        isVisible={showDamage.show}
        isCrit={showDamage.isCrit}
        position={showDamage.position}
      />

      {/* Enhanced Battle Log */}
      {battleLog.length > 0 && (
        <div className="battle-log-overlay enhanced">
          <div className="log-header">Battle Log</div>
          {battleLog.map((log, index) => (
            <div key={index} className={`log-message fade-in-${index}`}>
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Battle Field */}
      <div className="battle-field enhanced">
        {/* Player 1 Pokemon */}
        <div className="pokemon-area player1-area">
          <div className="pokemon-info-card enhanced">
            <div className="pokemon-name">
              {playerPokemon.name} ({currentPlayerName})
            </div>
            <div className="hp-display">
              <span className="hp-percentage">
                {Math.round(playerHPPercentage)}%
              </span>
              <div className="hp-bar enhanced">
                <div
                  className={`hp-fill ${playerTakingDamage ? 'damage-flash' : ''} ${
                    playerHPPercentage <= 25 ? 'critical' : playerHPPercentage <= 50 ? 'warning' : 'healthy'
                  }`}
                  style={{ width: `${playerHPPercentage}%` }}
                ></div>
              </div>
            </div>
            {/* Status indicator */}
            {playerStatus && (
              <div className="status-indicator">
                {playerStatus.type} ({playerStatus.duration})
              </div>
            )}
          </div>
          <div className="pokemon-sprite-container">
            <img
              src={playerPokemon.images?.player1 || playerPokemon.img}
              alt={playerPokemon.name}
              className={`pokemon-sprite-game player1-sprite ${
                playerAttacking ? 'attacking' : ''
              } ${playerTakingDamage ? 'taking-damage' : ''}`}
            />
          </div>
        </div>

        {/* Player 2 Pokemon */}
        <div className="pokemon-area player2-area">
          <div className="pokemon-info-card enhanced">
            <div className="pokemon-name">
              {opponentPokemon.name} ({currentOpponentName})
            </div>
            <div className="hp-display">
              <span className="hp-percentage">
                {Math.round(opponentHPPercentage)}%
              </span>
              <div className="hp-bar enhanced">
                <div
                  className={`hp-fill ${opponentTakingDamage ? 'damage-flash' : ''} ${
                    opponentHPPercentage <= 25 ? 'critical' : opponentHPPercentage <= 50 ? 'warning' : 'healthy'
                  }`}
                  style={{ width: `${opponentHPPercentage}%` }}
                ></div>
              </div>
            </div>
            {/* Status indicator */}
            {opponentStatus && (
              <div className="status-indicator">
                {opponentStatus.type} ({opponentStatus.duration})
              </div>
            )}
          </div>
          <div className="pokemon-sprite-container">
            <img
              src={opponentPokemon.images?.player2 || opponentPokemon.img}
              alt={opponentPokemon.name}
              className={`pokemon-sprite-game player2-sprite ${
                opponentAttacking ? 'attacking' : ''
              } ${opponentTakingDamage ? 'taking-damage' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Attack Panel */}
      {!winner && (
        <div className="attack-panel enhanced">
          <div className="attacks-header">
            {turn === 'player' && `${playerPokemon.name}'s Attacks`}
            {turn === 'opponent' && mode === '1v1' && `${opponentPokemon.name}'s Attacks`}
            {turn === 'ai' && 'Computer is selecting...'}
          </div>

          <div className="attacks-grid enhanced">
            {turn === 'player' &&
              playerPokemon.attacks.map((attack, idx) => (
                <button
                  key={idx}
                  className={`attack-button enhanced ${
                    playerAttackUses[idx] === 0 ? 'disabled' : ''
                  } ${playerAttackUses[idx] === 1 ? 'last-use' : ''}`}
                  disabled={playerAttackUses[idx] === 0 || !isPlayerTurn}
                  onClick={() => handleAttack(idx)}
                >
                  <div className="attack-name">
                    {attack.name}
                  </div>
                  <div className="attack-damage">
                    💥 {attack.damage || '??'} dmg
                  </div>
                  <div className="attack-type">
                    {attack.type}
                  </div>
                  <div className="attack-uses">
                    Uses: {playerAttackUses[idx]}
                  </div>
                </button>
              ))}

            {turn === 'opponent' &&
              mode === '1v1' &&
              opponentPokemon.attacks.map((attack, idx) => (
                <button
                  key={idx}
                  className={`attack-button enhanced ${
                    opponentAttackUses[idx] === 0 ? 'disabled' : ''
                  } ${opponentAttackUses[idx] === 1 ? 'last-use' : ''}`}
                  disabled={opponentAttackUses[idx] === 0}
                  onClick={() => handleOpponentAttack(idx)}
                >
                  <div className="attack-name">
                    {attack.name}
                  </div>
                  <div className="attack-damage">
                    💥 {attack.damage || '??'} dmg
                  </div>
                  <div className="attack-type">
                    {attack.type}
                  </div>
                  <div className="attack-uses">
                    Uses: {opponentAttackUses[idx]}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Enhanced Game Over Panel */}
      {winner && (
        <div className="game-over-panel enhanced">
          <div className="winner-announcement animated">
             {winner} Wins! 
          </div>
          <div className="victory-stats">
            {comboCount > 0 && <div>Max Combo: {comboCount}x</div>}
            <div>Final Score: {winner === currentPlayerName ? playerHP : opponentHP} HP remaining</div>
          </div>
          <div className="game-over-buttons">
            <button className="game-button play-again enhanced" onClick={handlePlayAgain}>
               Play Again
            </button>
            <button className="game-button home-button enhanced" onClick={handleBackHome}>
               Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;