export const degreesToOrdinal = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export const formatValue = (value, decimals) => {
  if (value === undefined || value === null) return '--';
  return typeof value === 'number' ? value.toFixed(decimals) : value;
};
