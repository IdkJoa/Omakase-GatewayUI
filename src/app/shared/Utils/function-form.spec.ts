import { FormControl } from '@angular/forms';
import { jsonValidator } from './function-form';

describe('jsonValidator Utils', () => {
  const validator = jsonValidator();

  it('1. should return null for valid JSON object string', () => {
    const control = new FormControl('{"name": "test", "active": true}');
    expect(validator(control)).toBeNull();
  });

  it('2. should return null for valid JSON array string', () => {
    const control = new FormControl('[1, 2, 3, "hello"]');
    expect(validator(control)).toBeNull();
  });

  it('3. should return null for valid JSON primitive (number, boolean, null)', () => {
    expect(validator(new FormControl('123'))).toBeNull();
    expect(validator(new FormControl('true'))).toBeNull();
    expect(validator(new FormControl('null'))).toBeNull();
  });

  it('4. should return null for empty string or null/undefined control value', () => {
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(undefined))).toBeNull();
  });

  it('5. should return { invalidJson: true } for invalid JSON syntax', () => {
    const control = new FormControl('{name: "invalid"}');
    expect(validator(control)).toEqual({ invalidJson: true });
  });

  it('6. should return { invalidJson: true } for unclosed JSON strings', () => {
    const control = new FormControl('{"key": "value"');
    expect(validator(control)).toEqual({ invalidJson: true });
  });

  it('7. should return { invalidJson: true } for plain non-JSON text', () => {
    const control = new FormControl('Just some plain text');
    expect(validator(control)).toEqual({ invalidJson: true });
  });

  it('8. should return null for valid nested JSON structure', () => {
    const control = new FormControl('{"user": {"id": 1, "roles": ["ADMIN"]}}');
    expect(validator(control)).toBeNull();
  });

  it('9. should return { invalidJson: true } for trailing commas in JSON', () => {
    const control = new FormControl('{"a": 1,}');
    expect(validator(control)).toEqual({ invalidJson: true });
  });

  it('10. should properly validate dynamically updated FormControl values', () => {
    const control = new FormControl('bad json');
    expect(validator(control)).toEqual({ invalidJson: true });

    control.setValue('{"status": "ok"}');
    expect(validator(control)).toBeNull();
  });
});
