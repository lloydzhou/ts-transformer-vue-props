import { props } from '../index'


interface Foo {
  foo: string;
}

type FooBar = {
  foo: string;
  foo1: string | number;
  bar?: number;
  baz: object;
  baz1?: object;
};

interface BarBaz {
  bar: Function;
  baz: Date;
}

interface Props {
  id: string
  name: string
  age: number
}

console.log('Foo', props<Foo>())
console.log('FooBar', props())
console.log('FooBar', props<FooBar>())
console.log('BarBaz', props<BarBaz>())
console.log('Props', props<Props>())

console.log('FooBar & BarBaz', props<BarBaz & BarBaz>())
console.log('FooBar | BarBaz', props<BarBaz | BarBaz>())

console.log('FooBar & any', props<BarBaz | any>())
console.log('FooBar | any', props<BarBaz | any>())

