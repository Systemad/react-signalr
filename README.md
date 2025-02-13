# React SignalR helper components

[![npm version](https://badge.fury.io/js/%40hwdtech%2Freact-signalr.svg)](https://badge.fury.io/js/%40hwdtech%2Freact-signalr)

This package exposes a set of utility components to work with SignalR hub connections and streams. [Storybook demo](https://hwdtech.github.io/react-signalr)

## Installation

```bash
npm install @systemad/react-signalr
```

## Motivation

Managing connections ins't easy, you have always to keep in mind when they should be closed, to prevent memory leaks and unnecessary resource allocations. React components on the other hand provides multiple ways to handle resources initialization and disposal: lifecycle hooks: `componentDidMount` and `componentWillUnmount` or new hooks API. These can be used to open and close underlying connections, so they can be used as disposable wrapper.

The same is true for Hub streams, since they are observables, so in order to get any value from them one have to subscribe. But subscriptions also have to be disposed.

## Versions 1.x

Coming soon, meanwhile you can hack into the examples:

- How to use connection context hook: https://github.com/hwdtech/react-signalr/blob/master/examples/ConnectionStatus.stories.tsx
- How to use connection stream hook: https://github.com/hwdtech/react-signalr/blob/master/examples/ConnectionStream.stories.tsx


## Versions 0.x

### SignalR hub connections

This library utilizes component lifecycle hooks to manage connections and provides a declarative way to open/close hub connections and uses [React context API](https://reactjs.org/docs/context.html)

```js
import { HubConnectionBuilder } from "@aspnet/signalr";
import { createConnectionContext } from "@hwdtech/react-signalr";

const createHubConnection = () => {
  /* build a connection instance here, for example */
  return new HubConnectionBuilder().withUrl("/chathub").build();
};

const { Provider, Consumer } = createConnectionContext(createHubConnection);

/* later in the code */

<Provider>
  <div>
    {/* somewhere deep in the application tree */}
    <Consumer>
      {({ connection, connectionError }) => {
        if (connection) return "Connected!";
        if (connectionError) return "Connection failed!";
        return "Connecting...";
      }}
    </Consumer>
  </div>
</Provider>;
```

When `Provider` component is mounted it attempts to open a connection the `createHubConnection` factory return. When `Provider` component is unmounted it attempt to close the connection it opened previously.

### SignalR streams

This library uses the same approach to dispose subscription as for closing hub connections.

```js
const { Provider, Consumer, createStreamSubscriber } = createConnectionContext(createHubConnection);

/**
 * createStreamSubscriber will return a react component which props will be mapped to a stream arguments.
 * In other words, under the hood the following code will be invoked to setup a stream:
 * <code>
 *   connection.stream('ObservableCounter', props.count, props.interval);
 * </code>
 */
const CounterSubscriber = createStreamSubscriber(
  'ObservableCounter', // hub stream name
  props => [props.count, props.interval] // mapper function from component props to hub stream arguments
);

/* later in the code */
<Provider>
  <div>
	{/* somewhere deep in the application tree */}
    <CounterSubscriber count={10} interval={1}>
    {({ value, error, done }) => {
	  if (done) return 'Done!';
      if (error) return error.message;
      if (value != null) return value;
      return Connecting...
    }}
    </CounterSubscriber>
  </div>
</Provider>;
```

When `CounterSubscriber` component is mounted it attempts to subscribe to a hub stream. The subscription will pass observable value to a children function. When `CounterSubscriber` is unmounted it attempts to dispose active subscription. Also note that `CounterSubscriber` don't need `Consumer` wrapper, since it uses it under the hood.

Since the `CounterSubscriber` takes children function as property you can create your own component that will handle hub stream side effects, like in the [example](https://github.com/hwdtech/react-signalr/blob/9bcc908aa5ec6d697dbf880aedd9e2daf79f5326/stories/createConnectionContext.stories.tsx#L55)
