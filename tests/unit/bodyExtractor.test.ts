import {jpv} from '../../src/helper';
import {body} from '../../src/awsAPIGatewayHelper';

describe('bodyExtractor', () => {
    it('should return undefined for {}', () => {
        expect(body()({})).toBeUndefined();
    });
    it('should return {} for {body: {}}', () => {
        expect(body()({body: {}})).toEqual({});
    });
    it('should return "Test" for {body: "Test"}', () => {
        expect(body()({body: "Test"})).toEqual("Test");
    });
    it('should return "1" from {body: "1"}', () => {
        expect(body()({body: "1"})).toEqual("1");
    });
    it('should return 1 from parseInteger and {body: "1"}', () => {
        expect(body((x) => parseInt(x, 10))({body: "1"})).toEqual(1);
    });
    it('should return { foo: 1, bar: "1" } from {body: { bar: "1", foo: 1 }', () => {
        expect(body()({body: { bar: "1", foo: 1 }})).toEqual({ bar: "1", foo: 1 });
    });
    it('should return { foo: 1, bar: "1" } from {foo: 5, body: { bar: "1", foo: 1 }}', () => {
        expect(body()({foo: 5, body: { bar: "1", foo: 1 }})).toEqual({ bar: "1", foo: 1 });
    });
    it('should return "1" from {foo: 5, body: { bar: "1", foo: 1 }}', () => {
        expect(body('bar')({foo: 5, body: { bar: "1", foo: 1 }})).toEqual("1");
    });
    it('should return "1" from {foo: 5, body: JSON.stringify({ bar: "1", foo: 1 })}', () => {
        expect(body('bar')({foo: 5, body: { bar: "1", foo: 1 }})).toEqual("1");
    });
});
