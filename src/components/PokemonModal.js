import '../styles/PokemonModal.css';

const PokemonModal = ({ pokemon, onClose }) => {
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };

  const mainType = pokemon.types[0].type.name;
  const modalStyle = {
    backgroundColor: typeColors[mainType] + '20',
    border: `3px solid ${typeColors[mainType]}`
  };

  const typeStyle = (type) => ({
    backgroundColor: typeColors[type],
    boxShadow: `0 2px 8px ${typeColors[type]}80`
  });

  const statColor = (statValue, statName) => {
    const maxStats = {
      hp: 255,
      attack: 190,
      defense: 230,
      'special-attack': 194,
      'special-defense': 230,
      speed: 180
    };

    const maxValue = maxStats[statName] || 255;
    const percentage = (statValue / maxValue) * 100;

    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#8BC34A';
    if (percentage >= 40) return '#FFC107';
    if (percentage >= 20) return '#FF9800';
    return '#F44336';
  };

  const getStatPercentage = (statValue, statName) => {
    const maxStats = {
      hp: 255,
      attack: 190,
      defense: 230,
      'special-attack': 194,
      'special-defense': 230,
      speed: 180
    };

    const maxValue = maxStats[statName] || 255;
    return Math.min(100, (statValue / maxValue) * 100);
  };

  const formatStatName = (statName) => {
    const statNames = {
      hp: 'HP',
      attack: 'Ataque',
      defense: 'Defensa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defensa Especial',
      speed: 'Velocidad'
    };
    return statNames[statName] || statName.replace('-', ' ');
  };

  const primaryColor = typeColors[mainType];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={modalStyle} onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="modal-header" style={{ borderBottomColor: primaryColor }}>
          <div className="pokemon-main-info">
            <h2 className="pokemon-name" style={{ color: primaryColor }}>
              {pokemon.name}
            </h2>
            <span className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
          </div>
          <div className="pokemon-types">
            {pokemon.types.map(typeInfo => (
              <span
                key={typeInfo.type.name}
                className="pokemon-type"
                style={typeStyle(typeInfo.type.name)}
              >
                {typeInfo.type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="modal-body">
          <div className="pokemon-image-section">
            <img
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className="pokemon-image-large"
            />
          </div>

          <div className="pokemon-details">
            <div className="detail-section">
              <h3 style={{ color: primaryColor }}>Información Básica</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Altura</span>
                  <span className="detail-value">{(pokemon.height / 10).toFixed(1)} m</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Peso</span>
                  <span className="detail-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experiencia Base</span>
                  <span className="detail-value">{pokemon.base_experience || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Orden</span>
                  <span className="detail-value">{pokemon.order}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3 style={{ color: primaryColor }}>Estadísticas</h3>
              <div className="stats-container">
                {pokemon.stats.map(stat => {
                  const statPercentage = getStatPercentage(stat.base_stat, stat.stat.name);
                  const color = statColor(stat.base_stat, stat.stat.name);

                  return (
                    <div key={stat.stat.name} className="stat-item">
                      <span className="stat-name">
                        {formatStatName(stat.stat.name)}
                      </span>
                      <div className="stat-value-display">
                        <span className="stat-number">{stat.base_stat}</span>
                      </div>
                      <div className="stat-bar-container">
                        <div
                          className="stat-bar"
                          style={{
                            width: `${statPercentage}%`,
                            backgroundColor: color,
                            boxShadow: `0 2px 6px ${color}80`
                          }}
                        >
                          <span className="stat-bar-text">{Math.round(statPercentage)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="stat-total">
                  <span className="stat-name">Total</span>
                  <div className="stat-value-display">
                    <span className="stat-number">
                      {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                    </span>
                  </div>
                  <div className="stat-bar-container">
                    <div
                      className="stat-bar-total"
                      style={{
                        width: `${Math.min(100, (pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0) / 600) * 100)}%`,
                        backgroundColor: primaryColor
                      }}
                    >
                      <span className="stat-bar-text">
                        {Math.round((pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0) / 600) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {pokemon.abilities && (
              <div className="detail-section">
                <h3 style={{ color: primaryColor }}>Habilidades</h3>
                <div className="abilities-container">
                  {pokemon.abilities.map(ability => (
                    <span
                      key={ability.ability.name}
                      className="ability-tag"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {ability.ability.name.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3 style={{ color: primaryColor }}>Sprites</h3>
              <div className="sprites-container">
                {pokemon.sprites.front_default && (
                  <div className="sprite-item">
                    <img src={pokemon.sprites.front_default} alt="Front" />
                    <span>Front</span>
                  </div>
                )}
                {pokemon.sprites.back_default && (
                  <div className="sprite-item">
                    <img src={pokemon.sprites.back_default} alt="Back" />
                    <span>Back</span>
                  </div>
                )}
                {pokemon.sprites.front_shiny && (
                  <div className="sprite-item">
                    <img src={pokemon.sprites.front_shiny} alt="Front Shiny" />
                    <span>Shiny</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="close-bottom-button"
            onClick={onClose}
            style={{ backgroundColor: primaryColor }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokemonModal;
