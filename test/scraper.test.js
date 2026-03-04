const { CONFIG, SELECTORS, validateConfig, validateSession } = require('../scraper');

describe('Configuration Constants', () => {
  describe('CONFIG', () => {
    test('should have OUTPUT_FILE defined as a non-empty string', () => {
      expect(CONFIG.OUTPUT_FILE).toBeDefined();
      expect(typeof CONFIG.OUTPUT_FILE).toBe('string');
      expect(CONFIG.OUTPUT_FILE.length).toBeGreaterThan(0);
    });

    test('should have DELAY_MS defined as a positive number', () => {
      expect(CONFIG.DELAY_MS).toBeDefined();
      expect(typeof CONFIG.DELAY_MS).toBe('number');
      expect(CONFIG.DELAY_MS).toBeGreaterThan(0);
    });

    test('should have RANDOM_DELAY_MIN defined as a positive number', () => {
      expect(CONFIG.RANDOM_DELAY_MIN).toBeDefined();
      expect(typeof CONFIG.RANDOM_DELAY_MIN).toBe('number');
      expect(CONFIG.RANDOM_DELAY_MIN).toBeGreaterThan(0);
    });

    test('should have RANDOM_DELAY_MAX defined as a positive number greater than RANDOM_DELAY_MIN', () => {
      expect(CONFIG.RANDOM_DELAY_MAX).toBeDefined();
      expect(typeof CONFIG.RANDOM_DELAY_MAX).toBe('number');
      expect(CONFIG.RANDOM_DELAY_MAX).toBeGreaterThan(CONFIG.RANDOM_DELAY_MIN);
    });

    test('should have SESSION_DIR defined as a non-empty string', () => {
      expect(CONFIG.SESSION_DIR).toBeDefined();
      expect(typeof CONFIG.SESSION_DIR).toBe('string');
      expect(CONFIG.SESSION_DIR.length).toBeGreaterThan(0);
    });
  });

  describe('SELECTORS', () => {
    test('should have MEMBER_CARD defined as a non-empty string', () => {
      expect(SELECTORS.MEMBER_CARD).toBeDefined();
      expect(typeof SELECTORS.MEMBER_CARD).toBe('string');
      expect(SELECTORS.MEMBER_CARD.length).toBeGreaterThan(0);
    });

    test('should have NAME_CONTAINER defined as a non-empty string', () => {
      expect(SELECTORS.NAME_CONTAINER).toBeDefined();
      expect(typeof SELECTORS.NAME_CONTAINER).toBe('string');
      expect(SELECTORS.NAME_CONTAINER.length).toBeGreaterThan(0);
    });

    test('should have NAME defined as a non-empty string', () => {
      expect(SELECTORS.NAME).toBeDefined();
      expect(typeof SELECTORS.NAME).toBe('string');
      expect(SELECTORS.NAME.length).toBeGreaterThan(0);
    });

    test('should have WORK_DETAILS defined as a non-empty string', () => {
      expect(SELECTORS.WORK_DETAILS).toBeDefined();
      expect(typeof SELECTORS.WORK_DETAILS).toBe('string');
      expect(SELECTORS.WORK_DETAILS.length).toBeGreaterThan(0);
    });

    test('should have PROFILE_LINK defined as a non-empty string', () => {
      expect(SELECTORS.PROFILE_LINK).toBeDefined();
      expect(typeof SELECTORS.PROFILE_LINK).toBe('string');
      expect(SELECTORS.PROFILE_LINK.length).toBeGreaterThan(0);
    });

    test('should have AVATAR_IMG defined as a non-empty string', () => {
      expect(SELECTORS.AVATAR_IMG).toBeDefined();
      expect(typeof SELECTORS.AVATAR_IMG).toBe('string');
      expect(SELECTORS.AVATAR_IMG.length).toBeGreaterThan(0);
    });
  });

  describe('validateConfig', () => {
    test('should return true for valid config object', () => {
      const validConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 2000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(validConfig)).toBe(true);
    });

    test('should return false when config is null', () => {
      expect(validateConfig(null)).toBe(false);
    });

    test('should return false when config is undefined', () => {
      expect(validateConfig(undefined)).toBe(false);
    });

    test('should return false when OUTPUT_FILE is missing', () => {
      const invalidConfig = {
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 2000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when OUTPUT_FILE is empty string', () => {
      const invalidConfig = {
        OUTPUT_FILE: '',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 2000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when SESSION_DIR is missing', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 2000
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when DELAY_MS is not a positive number', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: -1000,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 2000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when DELAY_MS is zero', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 0,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 2000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when RANDOM_DELAY_MIN is not a positive number', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 0,
        RANDOM_DELAY_MAX: 2000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when RANDOM_DELAY_MAX is not a positive number', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 500,
        RANDOM_DELAY_MAX: 0,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when RANDOM_DELAY_MAX is less than RANDOM_DELAY_MIN', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 2000,
        RANDOM_DELAY_MAX: 500,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });

    test('should return false when RANDOM_DELAY_MAX equals RANDOM_DELAY_MIN', () => {
      const invalidConfig = {
        OUTPUT_FILE: 'members.json',
        DELAY_MS: 1000,
        RANDOM_DELAY_MIN: 1000,
        RANDOM_DELAY_MAX: 1000,
        SESSION_DIR: './my_facebook_session'
      };
      expect(validateConfig(invalidConfig)).toBe(false);
    });
  });
});

describe('validateSession', () => {
  const fs = require('fs');
  const path = require('path');

  afterEach(() => {
    // Clean up test directories if they exist
    const testDir = './test_session';
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('when session directory does not exist', () => {
    test('should return false with error message for missing directory', async () => {
      const result = await validateSession('./nonexistent_directory_12345');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('when session directory exists', () => {
    test('should return true when session directory exists', async () => {
      const testDir = './test_session';
      fs.mkdirSync(testDir, { recursive: true });
      
      const result = await validateSession(testDir);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should return true with cookies info when Cookies file exists', async () => {
      const testDir = './test_session';
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'Cookies'), 'test cookie data');
      
      const result = await validateSession(testDir);
      expect(result.valid).toBe(true);
      expect(result.hasCookies).toBe(true);
    });

    test('should return true with cookies info when Cookies file does not exist', async () => {
      const testDir = './test_session';
      fs.mkdirSync(testDir, { recursive: true });
      
      const result = await validateSession(testDir);
      expect(result.valid).toBe(true);
      expect(result.hasCookies).toBe(false);
    });
  });

  describe('when session directory path is invalid', () => {
    test('should return false when path is null', async () => {
      const result = await validateSession(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    test('should return false when path is empty string', async () => {
      const result = await validateSession('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });
});
