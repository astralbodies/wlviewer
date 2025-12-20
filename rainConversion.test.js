/**
 * Jest tests for rain conversion functions
 */

const { convertRainValue, convertRainFields } = require('./rainConversion');

describe('convertRainValue', () => {
  describe('rain_size=1 (0.01" per count)', () => {
    test('14 counts should convert to 0.14 inches', () => {
      expect(convertRainValue(14, 1)).toBe(0.14);
    });

    test('1400 counts should convert to 14.00 inches', () => {
      expect(convertRainValue(1400, 1)).toBe(14.00);
    });
  });

  describe('rain_size=2 (0.2mm per count)', () => {
    test('10 counts should convert to approximately 0.0787 inches', () => {
      expect(convertRainValue(10, 2)).toBeCloseTo(0.0787402, 4);
    });

    test('0.15 counts should convert to approximately 0.00118 inches', () => {
      expect(convertRainValue(0.15, 2)).toBeCloseTo(0.00118, 5);
    });
  });

  describe('rain_size=3 (0.1mm per count)', () => {
    test('10 counts should convert to approximately 0.0394 inches', () => {
      expect(convertRainValue(10, 3)).toBeCloseTo(0.0394, 4);
    });
  });

  describe('rain_size=4 (0.001" per count)', () => {
    test('140 counts should convert to 0.14 inches', () => {
      expect(convertRainValue(140, 4)).toBe(0.14);
    });
  });

  describe('edge cases', () => {
    test('null count should return null', () => {
      expect(convertRainValue(null, 1)).toBeNull();
    });

    test('undefined count should return null', () => {
      expect(convertRainValue(undefined, 1)).toBeNull();
    });

    test('null rainSize should return null', () => {
      expect(convertRainValue(10, null)).toBeNull();
    });

    test('undefined rainSize should return null', () => {
      expect(convertRainValue(10, undefined)).toBeNull();
    });

    test('unknown rain_size should return raw count', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(convertRainValue(10, 99)).toBe(10);
      expect(consoleSpy).toHaveBeenCalledWith('Unknown rain_size value: 99, returning raw count');
      consoleSpy.mockRestore();
    });
  });
});

describe('convertRainFields', () => {
  test('should convert all rain fields in condition object with rain_size=1', () => {
    const testCondition = {
      lsid: 48308,
      rain_size: 1,
      rain_rate_last: 0,
      rain_15_min: 2,
      rain_60_min: 5,
      rain_24_hr: 14,
      rain_storm: 20,
      rainfall_daily: 14,
      rainfall_monthly: 100,
      rainfall_year: 500
    };

    const converted = convertRainFields(testCondition);

    expect(converted.rain_24_hr).toBe(0.14);
    expect(converted.rain_60_min).toBe(0.05);
    expect(converted.rainfall_year).toBe(5.00);
    expect(converted.rain_15_min).toBe(0.02);
    expect(converted.rain_storm).toBe(0.20);
    expect(converted.rainfall_daily).toBe(0.14);
    expect(converted.rainfall_monthly).toBe(1.00);
    expect(converted.rain_rate_last).toBe(0);
  });

  test('should preserve non-rain fields', () => {
    const testCondition = {
      lsid: 48308,
      rain_size: 1,
      rain_24_hr: 14,
      temp: 72.5,
      humidity: 65
    };

    const converted = convertRainFields(testCondition);

    expect(converted.lsid).toBe(48308);
    expect(converted.rain_size).toBe(1);
    expect(converted.temp).toBe(72.5);
    expect(converted.humidity).toBe(65);
  });

  test('should return original condition when rain_size is missing', () => {
    const noRainSize = { rain_24_hr: 14 };
    const notConverted = convertRainFields(noRainSize);

    expect(notConverted.rain_24_hr).toBe(14);
  });

  test('should return original when condition is null', () => {
    expect(convertRainFields(null)).toBeNull();
  });

  test('should return original when condition is undefined', () => {
    expect(convertRainFields(undefined)).toBeUndefined();
  });

  test('should handle condition with no rain fields', () => {
    const condition = {
      rain_size: 1,
      temp: 72.5,
      humidity: 65
    };

    const converted = convertRainFields(condition);

    expect(converted.temp).toBe(72.5);
    expect(converted.humidity).toBe(65);
  });

  test('should skip null rain field values', () => {
    const condition = {
      rain_size: 1,
      rain_24_hr: null,
      rain_60_min: 5
    };

    const converted = convertRainFields(condition);

    expect(converted.rain_24_hr).toBeNull();
    expect(converted.rain_60_min).toBe(0.05);
  });
});
