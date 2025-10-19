import '../styles/PokemonCard.css';

const PokemonCard = ({ pokemon, onClick }) => {
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
  const cardStyle = {
    backgroundColor: typeColors[mainType] + '40',
    borderColor: typeColors[mainType]
  };

  const typeStyle = (type) => ({
    backgroundColor: typeColors[type]
  });

  return (
    <div className="pokemon-card" style={cardStyle} onClick={onClick}>
      <div className="pokemon-image-container">
        <img 
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
          alt={pokemon.name}
          className="pokemon-image"
        />
      </div>
      <div className="pokemon-info">
        <span className="poke-id">N° {pokemon.id.toString().padStart(3, '0')}</span>
        <h3 className="pokemon-nombre">{pokemon.name}</h3>
        <div className="poke-types">
          {pokemon.types.map(typeInfo => (
            <span 
              key={typeInfo.type.name}
              className="poke-type"
              style={typeStyle(typeInfo.type.name)}
            >
              {typeInfo.type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
