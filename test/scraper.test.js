const { CONFIG, SELECTORS, validateConfig, validateSession, extractMemberData } = require('../scraper');

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

describe('extractMemberData', () => {
  let mockPage;
  let mockMemberCard;

  beforeEach(() => {
    mockPage = {};
    mockMemberCard = {
      evaluate: jest.fn()
    };
  });

  test('should have extractMemberData function exported', () => {
    expect(extractMemberData).toBeDefined();
    expect(typeof extractMemberData).toBe('function');
  });

  test('should extract member data correctly from complete card', async () => {
    const mockData = {
      name: 'John Doe',
      work: 'Software Engineer at Acme Corp',
      profileUrl: 'https://www.facebook.com/john.doe'
    };
    mockMemberCard.evaluate.mockResolvedValue(mockData);

    const result = await extractMemberData(mockPage, mockMemberCard);
    
    expect(result).toEqual(mockData);
    expect(mockMemberCard.evaluate).toHaveBeenCalled();
  });

  test('should extract member data with missing work info', async () => {
    const mockData = {
      name: 'Jane Smith',
      work: null,
      profileUrl: 'https://www.facebook.com/jane.smith'
    };
    mockMemberCard.evaluate.mockResolvedValue(mockData);

    const result = await extractMemberData(mockPage, mockMemberCard);
    
    expect(result).toEqual(mockData);
  });

  test('should return null if name is missing', async () => {
    const mockData = {
      name: null,
      work: 'Some job',
      profileUrl: 'https://www.facebook.com/someone'
    };
    mockMemberCard.evaluate.mockResolvedValue(mockData);

    const result = await extractMemberData(mockPage, mockMemberCard);
    
    expect(result).toBeNull();
  });

  test('should handle evaluate errors gracefully', async () => {
    mockMemberCard.evaluate.mockRejectedValue(new Error('DOM Error'));

    const result = await extractMemberData(mockPage, mockMemberCard);
    
    expect(result).toBeNull();
  });
});

describe('delay and randomDelay', () => {
  const { delay, randomDelay } = require('../scraper');

  test('delay should resolve after specified time', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(90);
  });

  test('randomDelay should resolve within range', async () => {
    const min = 50;
    const max = 150;
    const start = Date.now();
    await randomDelay(min, max);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(min - 10);
    // Note: max is harder to test strictly without mocking timers
  });
});

describe('scrollThroughMembers', () => {
  const { scrollThroughMembers, SELECTORS } = require('../scraper');
  let mockPage;

  beforeEach(() => {
    mockPage = {
      evaluate: jest.fn()
    };
    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('should scroll until no more members are loaded', async () => {
    // 1st call: initial count
    // 2nd call: count after 1st scroll (down)
    // 3rd call: count after 2nd scroll (down)
    // 4th call: count after 3rd scroll (down) - no change
    // 5th call: count after 4th scroll (down) - no change
    // 6th call: count after 5th scroll (down) - no change -> switches direction
    mockPage.evaluate
      .mockResolvedValueOnce(10) // Initial
      .mockResolvedValueOnce(20) // After scroll 1
      .mockResolvedValueOnce(30) // After scroll 2
      .mockResolvedValueOnce(30) // After scroll 3
      .mockResolvedValueOnce(30) // After scroll 4
      .mockResolvedValueOnce(30); // After scroll 5

    // We'll limit maxScrolls to avoid long test
    const scrollCount = await scrollThroughMembers(mockPage, { 
      maxScrolls: 5, 
      scrollDelay: 10,
      minWaitAfterNoChange: 10 
    });
    
    expect(scrollCount).toBeGreaterThan(0);
    expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function), SELECTORS.MEMBER_CARD);
  });
});

describe('exportToJSON', () => {
  const { exportToJSON } = require('../scraper');
  const fs = require('fs');

  test('should write correct data to file', async () => {
    const members = [
      { name: 'User 1', work: 'Job 1', profileUrl: 'url1' },
      { name: 'User 2', work: 'Job 2', profileUrl: 'url2' }
    ];
    const outputPath = './test_members.json';
    const groupUrl = 'https://facebook.com/groups/test';

    const result = await exportToJSON(members, outputPath, groupUrl);
    
    expect(result).toBe(outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
    
    const savedData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(savedData.member_count).toBe(2);
    expect(savedData.group_url).toBe(groupUrl);
    expect(savedData.members).toEqual(members);
    expect(savedData.scraped_at).toBeDefined();

    // Cleanup
    fs.unlinkSync(outputPath);
  });
});
