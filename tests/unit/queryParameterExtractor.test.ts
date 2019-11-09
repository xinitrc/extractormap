import {queryParameter} from '../../src/awsAPIGatewayHelper';

describe('queryParameter', () => {
    it('should return undefined for "key" and {body: {}}', () => {
        expect(queryParameter('key')({body: {}})).toBeUndefined();
    });
    it('should return "Test" for "key" and {queryParameters: { key: {}}, body: "Test"}', () => {
        expect(queryParameter('key')({queryParameters: { key: {}}, body: "Test"})).toEqual({});
    });
    it('should return "1" for "key" and {queryParameters: { key: "1"}, body: "Test"}', () => {
        expect(queryParameter('key')({queryParameters: { key: "1"}, body: "Test"})).toEqual("1");
    });
    it('should return 1 for "key" and {queryParameters: { key: "1"}, body: "Test"}', () => {
        expect(queryParameter('key', (x) => parseInt(x, 10))({queryParameters: { key: "1"}, body: "Test"})).toEqual(1);
    });
    it('should return 5 from "key" and { queryParameters: { key: 5 } , body: { bar: "1", foo: 1 }}', () => {
        expect(queryParameter('key')({ queryParameters: { key: "5" } , body: { bar: "1", foo: 1 }})).toEqual("5");
    });
    it('should return undefine from "bar" and { queryParameters: { key: 5 } , body: { bar: "1", foo: 1 }}', () => {
        expect(queryParameter('bar')({ queryParameters: { key: "5" } , body: { bar: "1", foo: 1 }})).toEqual(undefined);
    });
});
