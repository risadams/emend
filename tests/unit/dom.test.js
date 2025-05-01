/**
 * Tests for DOM integration and edge cases
 */
import { jest } from '@jest/globals';

// Create a more complex DOM test environment
document.body.innerHTML = `
  <div id="container">
    <a id="empty-href" href="">Empty href</a>
    <a id="no-href">No href attribute</a>
    <a id="null-href" href="null">Null href</a>
    <a id="valid-mailto" href="mailto:valid@example.com">Valid mailto</a>
    <a id="explicit-mailto" href="mailto:@encrypted-value">Explicit mailto</a>
    <a id="explicit-custom" href="mailto:#custom-encrypted-value">Custom prefix mailto</a>
    <div class="nested">
      <a id="nested-mailto" href="mailto:nested@example.com">Nested mailto</a>
    </div>
  </div>
`;

// Import the module
import emend, { Emend } from '../../src/emend.js';

describe('DOM Integration and Edge Cases', () => {
  // Store original functions
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;
  
  // Cleanup between tests
  beforeEach(() => {
    // Reset all link states
    document.querySelectorAll('a').forEach(anchor => {
      anchor.removeAttribute('data-emended-mailto');
      
      // Reset hrefs to original state
      if (anchor.id === 'empty-href') anchor.href = '';
      if (anchor.id === 'no-href') anchor.removeAttribute('href');
      if (anchor.id === 'null-href') anchor.href = 'null';
      if (anchor.id === 'valid-mailto') anchor.href = 'mailto:valid@example.com';
      if (anchor.id === 'explicit-mailto') anchor.href = 'mailto:@encrypted-value';
      if (anchor.id === 'explicit-custom') anchor.href = 'mailto:#custom-encrypted-value';
      if (anchor.id === 'nested-mailto') anchor.href = 'mailto:nested@example.com';
      
      // Remove any event listeners
      const newAnchor = anchor.cloneNode(true);
      anchor.parentNode.replaceChild(newAnchor, anchor);
    });
    
    // Reset mocks
    jest.resetAllMocks();
    
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
  
  test('should handle links without href attribute', () => {
    const instance = new Emend();
    instance.init();
    
    const noHrefLink = document.getElementById('no-href');
    expect(noHrefLink.getAttribute('data-emended-mailto')).toBeNull();
  });
  
  test('should handle links with empty href attribute', () => {
    const instance = new Emend();
    instance.init();
    
    const emptyHrefLink = document.getElementById('empty-href');
    expect(emptyHrefLink.getAttribute('data-emended-mailto')).toBeNull();
  });
  
  test('should handle links with non-mailto href attribute', () => {
    const instance = new Emend();
    instance.init();
    
    const nullHrefLink = document.getElementById('null-href');
    expect(nullHrefLink.getAttribute('data-emended-mailto')).toBeNull();
  });
  
  test('should process nested mailto links', () => {
    const instance = new Emend();
    instance.init();
    
    const nestedLink = document.getElementById('nested-mailto');
    expect(nestedLink.getAttribute('data-emended-mailto')).not.toBeNull();
    expect(nestedLink.getAttribute('href')).toBe('#');
  });
  
  test('should respect explicitPrefix setting', () => {
    const instance = new Emend();
    instance.init({
      explicitPrefix: '#',
      salt: 'TESTSALT'
    });
    
    const explicitCustomLink = document.getElementById('explicit-custom');
    expect(explicitCustomLink.getAttribute('data-emended-mailto')).toBe('custom-encrypted-value');
    expect(explicitCustomLink.getAttribute('href')).toBe('#');
  });
  
  test('should correctly handle explicitOnly mode - true', () => {
    const instance = new Emend();
    instance.init({
      explicitOnly: true,
      explicitPrefix: '@',
      salt: 'TESTSALT'
    });
    
    // Regular mailto should not be protected
    const validLink = document.getElementById('valid-mailto');
    expect(validLink.getAttribute('data-emended-mailto')).toBeNull();
    expect(validLink.href).toContain('mailto:valid@example.com');
    
    // Explicit mailto should be protected
    const explicitLink = document.getElementById('explicit-mailto');
    expect(explicitLink.getAttribute('data-emended-mailto')).toBe('encrypted-value');
    expect(explicitLink.getAttribute('href')).toBe('#');
  });
  
  test('should correctly handle explicitOnly mode - false', () => {
    const instance = new Emend();
    instance.init({
      explicitOnly: false,
      explicitPrefix: '@',
      salt: 'TESTSALT'
    });
    
    // Regular mailto should be protected
    const validLink = document.getElementById('valid-mailto');
    expect(validLink.getAttribute('data-emended-mailto')).not.toBeNull();
    expect(validLink.getAttribute('href')).toBe('#');
    
    // Explicit mailto should be protected
    const explicitLink = document.getElementById('explicit-mailto');
    expect(explicitLink.getAttribute('data-emended-mailto')).toBe('encrypted-value');
    expect(explicitLink.getAttribute('href')).toBe('#');
  });
  
  test('should add click handlers to mailto links', () => {
    // Replace this test to avoid direct DOM events that cause issues
    const validLink = document.getElementById('valid-mailto');
    const explicitLink = document.getElementById('explicit-mailto');
    const nestedLink = document.getElementById('nested-mailto');
    
    // Spy on addEventListener
    const addSpy1 = jest.spyOn(validLink, 'addEventListener');
    const addSpy2 = jest.spyOn(explicitLink, 'addEventListener');
    const addSpy3 = jest.spyOn(nestedLink, 'addEventListener');
    
    const instance = new Emend();
    instance.init();
    
    // Check that addEventListener was called for each mailto link
    expect(addSpy1).toHaveBeenCalledWith('click', expect.any(Function));
    expect(addSpy2).toHaveBeenCalledWith('click', expect.any(Function));
    expect(addSpy3).toHaveBeenCalledWith('click', expect.any(Function));
  });
  
  test('should wire up click handlers that call sendMail', () => {
    // Set up mocks
    const sendMailMock = jest.fn();
    
    // Get a mailto link
    const validLink = document.getElementById('valid-mailto');
    
    // Create a simple mock event
    const mockEvent = { preventDefault: jest.fn(), target: validLink };
    
    // Create a new Emend instance with mocked sendMail
    const instance = new Emend();
    instance.sendMail = sendMailMock;
    
    // Store the original addEventListener to restore it later
    const originalAddEventListener = validLink.addEventListener;
    
    // Replace addEventListener with our spy version
    let capturedHandler;
    validLink.addEventListener = jest.fn((event, handler) => {
      if (event === 'click') {
        capturedHandler = handler;
      }
      // Don't actually add the event listener in the test
    });
    
    // Call init which will use our mocked addEventListener
    instance.init();
    
    // Verify addEventListener was called
    expect(validLink.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    
    // Call the captured handler directly
    capturedHandler(mockEvent);
    
    // Verify our expectations
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(validLink);
    
    // Restore the original method
    validLink.addEventListener = originalAddEventListener;
  });
  
  test('sendMail should handle timeout values correctly', () => {
    jest.spyOn(window, 'setTimeout');
    
    // Mock the relevant functions
    const mockAnchor = {
      click: jest.fn(),
      style: {}
    };
    
    document.createElement = jest.fn().mockReturnValue(mockAnchor);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    const instance = new Emend();
    instance.init({
      sendClickDelay: 123,
      domRemoveDelay: 456
    });
    
    // Setup target with the required attribute
    const validLink = document.getElementById('valid-mailto');
    validLink.setAttribute('data-emended-mailto', 'test-value');
    
    // Directly call sendMail 
    instance.sendMail(validLink);
    
    // Verify timing functions were called correctly
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 123);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 456);
  });
});