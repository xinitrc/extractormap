// General Helper
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
import {ConverterFunction} from '../ExtractorMap.types';

type _EQ<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<TT>() => TT extends Y ? 1 : 2) ? true : false;

// List Helper
type _Tail<T extends readonly unknown[]> = T extends readonly [any, ...infer RST] ? RST : [];

// First Parameter, if input is function
type _ConditionalFirstParameter<T> = T extends (x: infer P) => unknown ? P : never;

// Check if array is composable types
type _IsComposable<OutputT, FN> = FN extends (x: any) => OutputT ? true : false;
type _AreComposable<OutputT, InputT, FNs extends readonly unknown[]> = FNs['length'] extends 0 ? _EQ<OutputT, InputT>
    : (_IsComposable<OutputT, FNs[0]> extends true ? _AreComposable<_ConditionalFirstParameter<FNs[0]>, InputT, _Tail<FNs>> : false);
type _Composables<OutputT, InputT, FNs extends readonly unknown[]> = _AreComposable<OutputT, InputT, FNs> extends true ? FNs & ReadonlyArray<UnaryFunction<any, any>> : never;

type UnaryFunction<O, I> = (input: I) => O;
export type ComposeInput<Z, Y, B, A, K extends readonly unknown[]> = [UnaryFunction<Z, B>, UnaryFunction<B, A>] | [UnaryFunction<Z, Y>, ..._Composables<Y, B, K>, UnaryFunction<B, A>];

export function compose<Z, Y, B, A, K extends readonly unknown[]>(...args: ComposeInput<Z, Y, B, A, K>): UnaryFunction<Z, A> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (input: A): Z => args.reverse().reduce((a: any, fn: UnaryFunction<any, any>): any => fn(a), input);
}

export function fmap<T, S>(fn: ConverterFunction<T, S>): ConverterFunction<Array<T>, Array<S>> {
    return (input: Array<S>): Array<T> => input.map(fn);
}

