import {pathParameter} from '../../src/awsAPIGatewayHelper';

describe('pathParameter', () => {
    it('should return undefined for "key" and {body: {}}', () => {
        expect(pathParameter('key')({body: {}})).toBeUndefined();
    });
    it('should return "Test" for "key" and {pathParameters: { key: {}}, body: "Test"}', () => {
        expect(pathParameter('key')({pathParameters: { key: {}}, body: "Test"})).toEqual({});
    });
    it('should return "1" for "key" and {pathParameters: { key: "1"}, body: "Test"}', () => {
        expect(pathParameter('key')({pathParameters: { key: "1"}, body: "Test"})).toEqual("1");
    });
    it('should return 1 for "key" and {pathParameters: { key: "1"}, body: "Test"}', () => {
        expect(pathParameter('key', (x) => parseInt(x, 10))({pathParameters: { key: "1"}, body: "Test"})).toEqual(1);
    });
    it('should return 5 from "key" and { pathParameters: { key: 5 } , body: { bar: "1", foo: 1 }}', () => {
        expect(pathParameter('key')({ pathParameters: { key: "5" } , body: { bar: "1", foo: 1 }})).toEqual("5");
    });
    it('should return undefine from "bar" and { pathParameters: { key: 5 } , body: { bar: "1", foo: 1 }}', () => {
        expect(pathParameter('bar')({ pathParameters: { key: "5" } , body: { bar: "1", foo: 1 }})).toEqual(undefined);
    });
});
