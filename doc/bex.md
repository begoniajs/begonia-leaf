
形式1

```js
{
  //...
  observed: {
    ['propName']: {
      update(value, no) {

      },
      initGet: true 
    }
  },
  //...
}

```

形式2

```js
{
  //...
  observed: {
    ['propName'](value, no) {

    }
  },
  //...
}

```

形式3

```js
{
  //...
  observed: {
    'propName': 'propName'
  },
  //...
}

```

形式4

```js
{
  //...
  observed: [
      {
        prop: 'prop1',
        update(value, no) {

        },
        initGet: true
      },
      'prop2'
  ]
  //...
}

```


形式1

```js
{
  //...
  observed: {
    ...mapGetters(['prop1', 'prop2'])
  }
  //...
}
```

形式2

```js
{
  //...
  observed: {
    ...mapGetters([
      {
        prop: 'prop1',
        update(value, no) {

        },
        initGet: true
      }
    ])
  }
  //...
}

```


