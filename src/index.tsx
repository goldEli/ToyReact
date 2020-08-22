import * as React from "./react";

class MyComponent extends React.Componnet {
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        {this.children}
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
console.log(123, app);
React.render(app, document.getElementById("root"));
