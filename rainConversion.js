/**
 * Rain Conversion Utilities
 *
 * Converts rain count values from WeatherLink Live API to inches.
 * Rain values are received as counts (bucket tips) and must be multiplied
 * by a conversion factor based on the rain_size field.
 */

/**
 * Convert rain count value to inches based on rain_size field
 * @param {number} count - Raw count value from sensor
 * @param {number} rainSize - rain_size field value (1-4)
 * @returns {number|null} - Converted value in inches, or null if invalid
 */
function convertRainValue(count, rainSize) {
  if (count === undefined || count === null) return null;
  if (rainSize === undefined || rainSize === null) return null;

  // Conversion factors to inches
  const CONVERSION_FACTORS = {
    1: 0.01,        // 0.01 inches per count
    2: 0.00787402,  // 0.2 mm per count → inches (0.2 / 25.4)
    3: 0.00393701,  // 0.1 mm per count → inches (0.1 / 25.4)
    4: 0.001        // 0.001 inches per count
  };

  const factor = CONVERSION_FACTORS[rainSize];
  if (!factor) {
    console.warn(`Unknown rain_size value: ${rainSize}, returning raw count`);
    return count;
  }

  return count * factor;
}

/**
 * Convert all rain fields in a condition object to inches
 * @param {object} condition - Weather condition object
 * @returns {object} - Condition object with converted rain values
 */
function convertRainFields(condition) {
  if (!condition || !condition.rain_size) return condition;

  const rainSize = condition.rain_size;
  const rainFields = [
    'rain_rate_last',
    'rain_15_min',
    'rain_60_min',
    'rain_24_hr',
    'rain_storm',
    'rainfall_daily',
    'rainfall_monthly',
    'rainfall_year'
  ];

  const converted = { ...condition };

  rainFields.forEach(field => {
    if (converted[field] !== undefined && converted[field] !== null) {
      const convertedValue = convertRainValue(converted[field], rainSize);
      if (convertedValue !== null) {
        converted[field] = convertedValue;
      }
    }
  });

  return converted;
}

module.exports = {
  convertRainValue,
  convertRainFields
};
