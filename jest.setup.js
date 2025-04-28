import "@testing-library/jest-dom"
// jest.setup.js or at the top of your test file
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
