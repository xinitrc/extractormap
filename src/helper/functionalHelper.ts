import {ConverterFunction} from '../ExtractorMap.types';

// Typehelper
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
type _EQ<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<TT>() => TT extends Y ? 1 : 2) ? true : false;
type _AND<X extends boolean, Y extends boolean> = X extends true ? Y : false;

// List Helper
type _Tail<T extends readonly unknown[]> = T extends readonly [any, ...infer RST] ? RST : [];

// First Parameter, if input is function
type _ConditionalFirstParameter<T> = T extends (x: infer P) => unknown ? P : never;

// Check if array is an array   of composable functions
type _IsComposable<OutputT, FN> = FN extends (x: any) => OutputT ? true : false;
type _AreComposable<OutputT, InputT, FNs extends readonly unknown[]> = FNs['length'] extends 0 ? _EQ<OutputT, InputT>
    : _AND<_IsComposable<OutputT, FNs[0]>, _AreComposable<_ConditionalFirstParameter<FNs[0]>, InputT, _Tail<FNs>>>;
type _Composables<OutputT, InputT, FNs extends readonly unknown[]> = _AreComposable<OutputT, InputT, FNs> extends true ? FNs & ReadonlyArray<UnaryFunction<any, any>> : never;

type UnaryFunction<O, I> = (input: I) => O;
export type ComposeInput<Z, Y, B, A, K extends readonly unknown[]> = [UnaryFunction<Z, Y>, ..._Composables<Y, B, K>, UnaryFunction<B, A>];

/**
 * This function implements general functional composition
 * it combines the functions from right to left (as is usual in mathematics)
 * compose(f, g, h) is equivalent to (input) => f(g(h(input)))
 * the input and output type will make sure that the types of the functions
 * are compatible with one another
 **/
export function compose<Z, Y, A>(...args: [UnaryFunction<Z, Y>, UnaryFunction<Y, A>]): UnaryFunction<Z, A>
export function compose<Z, Y, A, B, K extends readonly unknown[]>(...args: ComposeInput<Z, Y, B, A, K>): UnaryFunction<Z, A>
export function compose<Z, A>(...args: ReadonlyArray<UnaryFunction<any, any>>): UnaryFunction<Z, A> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (input: A): Z => args.reduceRight((a: any, fn: UnaryFunction<any, any>): any => fn(a), input);
}

export function fmap<T, S>(fn: ConverterFunction<T, S>): ConverterFunction<Array<T>, Array<S>> {
    return (input: Array<S>): Array<T> => input.map(fn);
}
