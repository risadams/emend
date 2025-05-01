/**
 * Tests for the Emend class
 */
import { jest } from '@jest/globals';

// Set up our mocks before importing the module
document.body.innerHTML = `
  <a id="test1" href="mailto:test@example.com">Test 1</a>
  <a id="test2" href="mailto:@3f2e383f0b2e332a263b272e65282426">Test 2</a>
  <a id="test3" href="https://example.com">Test 3</a>
`;

// Import the module
import emend, { Emend } from '../../src/emend.js';

describe('Emend Class', () => {
  // Mock DOM-related functions
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Clear any previous initialization
    document.querySelectorAll('a').forEach(anchor => {
      anchor.removeAttribute('data-emended-mailto');
      if (anchor.id === 'test1') {
        anchor.href = 'mailto:test@example.com';
      } else if (anchor.id === 'test2') {
        anchor.href = 'mailto:@3f2e383f0b2e332a263b272e65282426';
      }
    });

    // Mock functions
    document.createElement = jest.fn().mockImplementation((tag) => {
      const elem = originalCreateElement.call(document, tag);
      if (tag === 'a') {
        elem.click = jest.fn();
      }
      return elem;
    });

    document.body.appendChild = jest.fn().mockImplementation(originalAppendChild);
    document.body.removeChild = jest.fn().mockImplementation(originalRemoveChild);
    
    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original functions
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    test('should create an instance with default options', () => {
      const instance = new Emend();
      expect(instance).toBeInstanceOf(Emend);
      expect(instance.version).toBe('1.1.0');
    });

    test('should create an instance with custom options', () => {
      const options = {
        salt: 'CUSTOMSALT',
        explicitPrefix: '#',
        explicitOnly: true
      };
      
      const instance = new Emend(options);
      expect(instance).toBeInstanceOf(Emend);
      
      // Initialize to access options
      instance.init();
      
      // We can't directly test private fields, but we can test behavior
      const anchor = document.getElementById('test1');
      expect(anchor.getAttribute('data-emended-mailto')).toBeNull(); // explicitOnly is true
    });
  });

  describe('init method', () => {
    test('should initialize with default options', () => {
      const instance = new Emend();
      const result = instance.init();
      
      // Check if it returns the instance for chaining
      expect(result).toBe(instance);
      
      // Check if non-explicit mailto links are protected
      const anchor = document.getElementById('test1');
      expect(anchor.getAttribute('data-emended-mailto')).not.toBeNull();
      expect(anchor.href).toBe('http://localhost/#');
    });

    test('should initialize with custom options', () => {
      const instance = new Emend();
      instance.init({
        salt: 'TESTSALT',
        explicitPrefix: '#',
        explicitOnly: true
      });
      
      // Check if explicitOnly is respected
      const anchor = document.getElementById('test1');
      expect(anchor.getAttribute('data-emended-mailto')).toBeNull(); // Not encoded due to explicitOnly
      expect(anchor.href).toBe('mailto:test@example.com');
    });

    test('should handle explicit mailto links', () => {
      const instance = new Emend();
      instance.init({
        salt: 'TESTSALT',
        explicitPrefix: '@'
      });
      
      const anchor = document.getElementById('test2');
      expect(anchor.getAttribute('data-emended-mailto')).toBe('3f2e383f0b2e332a263b272e65282426');
      expect(anchor.href).toBe('http://localhost/#');
    });

    test('should add click listeners to mailto links', () => {
      const spy = jest.spyOn(HTMLAnchorElement.prototype, 'addEventListener');
      
      const instance = new Emend();
      instance.init();
      
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
      spy.mockRestore();
    });
  });

  describe('encode and decode methods', () => {
    test('encode should encrypt an email address', () => {
      const instance = new Emend();
      instance.init({ salt: 'TESTSALT' });
      
      const email = 'test@example.com';
      const encoded = instance.encode(email);
      
      expect(typeof encoded).toBe('string');
      expect(encoded).not.toBe(email);
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('encode should handle mailto: prefix', () => {
      const instance = new Emend();
      instance.init({ salt: 'TESTSALT' });
      
      const withPrefix = 'mailto:test@example.com';
      const withoutPrefix = 'test@example.com';
      
      const encodedWithPrefix = instance.encode(withPrefix);
      const encodedWithoutPrefix = instance.encode(withoutPrefix);
      
      expect(encodedWithPrefix).toBe(encodedWithoutPrefix);
    });

    test('decode should decrypt an encrypted string', () => {
      const instance = new Emend();
      instance.init({ salt: 'TESTSALT' });
      
      const email = 'test@example.com';
      const encoded = instance.encode(email);
      const decoded = instance.decode(encoded);
      
      expect(decoded).toBe(email);
    });
  });

  describe('protect method', () => {
    test('should encode and protect an anchor element', () => {
      const instance = new Emend();
      instance.init({ salt: 'TESTSALT' });
      
      const anchor = document.getElementById('test1');
      // Reset the anchor to its original state
      anchor.href = 'mailto:test@example.com';
      anchor.removeAttribute('data-emended-mailto');
      
      const result = instance.protect(anchor);
      
      expect(anchor.getAttribute('data-emended-mailto')).not.toBeNull();
      expect(anchor.getAttribute('href')).toBe('#');
      expect(result).toBe(anchor); // Should return the anchor for chaining
    });
  });

  describe('sendMail method', () => {
    test('should simulate creating a temporary link and clicking it', () => {
      // Setup mocks more carefully
      const mockLink = document.createElement('a');
      mockLink.click = jest.fn();
      document.createElement = jest.fn().mockReturnValue(mockLink);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();

      const instance = new Emend();
      instance.init({
        salt: 'TESTSALT',
        sendClickDelay: 50,
        domRemoveDelay: 100
      });
      
      // Manually set up the element with data attribute
      const anchor = document.getElementById('test1');
      anchor.setAttribute('data-emended-mailto', '76657374406578616d706c652e636f6d');
      
      // Call sendMail directly
      instance.sendMail(anchor);
      
      // Verify the link was created and appended
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      
      // Advance timer for click
      jest.advanceTimersByTime(50);
      expect(mockLink.click).toHaveBeenCalled();
      
      // Advance timer for removal
      jest.advanceTimersByTime(100);
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    test('should do nothing if element has no data-emended-mailto attribute', () => {
      document.createElement = jest.fn();
      
      const instance = new Emend();
      instance.init();
      
      // Non-mailto link
      const anchor = document.getElementById('test3');
      instance.sendMail(anchor);
      
      jest.runAllTimers();
      expect(document.createElement).not.toHaveBeenCalled();
    });
  });

  describe('singleton instance', () => {
    test('default export should be a singleton instance', () => {
      expect(emend).toBeInstanceOf(Emend);
    });
  });

  describe('version getter', () => {
    test('should return the correct version number', () => {
      expect(emend.version).toBe('1.1.0');
      
      const instance = new Emend();
      expect(instance.version).toBe('1.1.0');
    });
  });
});