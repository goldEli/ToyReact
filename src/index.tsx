import * as React from "./react";

class MyComponent extends React.Componnet {
  state: {};
  constructor() {
    super();
    this.state = {
      a: 1,
      b: 4
    };
  }
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        <button
          onClick={() => {
            this.setState({ a: ++this.state.a });
          }}
        >
          add
        </button>
        <p>{this.state.a.toString()}</p>
        <p>{this.state.b.toString()}</p>
      </div>
    );
  }
}

const app = (
  <MyComponent>
    <h1>123</h1>
    <div id="a" className="b">
      123
    </div>
  </MyComponent>
);

React.render(app, document.getElementById("root"));
