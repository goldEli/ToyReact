type Child = ElementWapper | Component | TextWapper;
interface Props {
  [key: string]: string;
}

interface State {
  [key: string]: any;
}

export class Component {
  _root = null;
  _range: Range | null = null;
  state: {} | null = null;
  children: Child[] = [];
  props: Props = Object.create({});
  // type: string;

  get vdom() {
    return this.render().vdom;
  }

  setAttribute(key: string, value: string) {
    this.props[key] = value;
  }
  appendChild(Component: ElementWapper | TextWapper) {
    this.children.push(Component);
  }

  setState(newState: State) {
    const oldState = this.state;
    if (oldState === null) {
      this.state = newState;
      this.reRenderToDom();
      return;
    }
    const merge = (newState: State, oldState: State) => {
      for (let key in newState) {
        if (oldState[key] !== null && typeof oldState[key] === "object") {
          merge(newState[key], oldState[key]);
          continue;
        }
        oldState[key] = newState[key];
      }
    };

    merge(newState, oldState);
    this.reRenderToDom();
  }

  _renderToDom(range: Range) {
    this._range = range;

    this.render()._renderToDom(range);
  }
  reRenderToDom() {
    let oldRange = this._range;

    const range = document.createRange();
    range.setStart(oldRange?.startContainer, oldRange.startOffset);
    range.setEnd(oldRange?.startContainer, oldRange.startOffset);
    this._renderToDom(range);

    oldRange?.setStart(range.endContainer, range.endOffset);
    oldRange?.deleteContents();
  }
}

class ElementWapper extends Component {
  // root: HTMLElement;
  type: string;
  constructor(type: string) {
    super();
    this.type = type;
    // this.root = document.createElement(type);
  }
  get vdom() {
    return this;
    // return {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map((child) => child.vdom)
    // };
  }
  /*
  setAttribute(key: string, value: string) {
    if (key.match(/^on([\s\S]+)/)) {
      this.root.addEventListener(RegExp.$1.toLocaleLowerCase(), value);
    }
    if (key === "className") {
      key = "class";
    }
    this.root.setAttribute(key, value);
  }
  appendChild(component: ElementWapper | TextWapper) {
    // console.log(Component);
    // this.root.appendChild(Component.root);
    const range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    // range.deleteContents();
    // range.insertNode(component.root)
    component?._renderToDom?.(range);
  }
  */
  _renderToDom(range: Range) {
    // const range = document.createRange()
    range.deleteContents();
    let root = document.createElement(this.type);

    for (let key in this.props) {
      const value = this.props[key];
      if (key.match(/^on([\s\S]+)/)) {
        root.addEventListener(RegExp.$1.toLocaleLowerCase(), value);
      }
      if (key === "className") {
        key = "class";
      }
      root.setAttribute(key, value);
    }

    for (let child of this.children) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child?._renderToDom?.(childRange);
    }

    range.insertNode(root);
  }
}

class TextWapper extends Component {
  root: Text;
  content: string;
  type = "text";
  constructor(content: string) {
    super();
    this.content = content;
    this.root = document.createTextNode(content);
  }
  get vdom() {
    return this;
    // return {
    //   type: "text",
    //   content: this.content
    // };
  }
  _renderToDom(range: Range) {
    // const range = document.createRange()
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export const render = (
  component: ElementWapper | TextWapper,
  container: HTMLElement
) => {
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(container, container.childNodes.length);
  range.deleteContents();
  component._renderToDom(range);
};

export const createElement = (
  type: string | Component,
  attributes: { [key: string]: string },
  ...children: Child[]
) => {
  let e: ElementWapper;
  if (typeof type === "string") {
    e = new ElementWapper(type);
  } else {
    e = new type();
  }
  for (let key in attributes) {
    if ("__source" === key) {
      continue;
    }
    e.setAttribute(key, attributes[key]);
  }

  function insetChild(children: Child[]) {
    for (let child of children) {
      if (typeof child === "string") {
        child = new TextWapper(child);
      }
      if (typeof child === "object" && child instanceof Array) {
        insetChild(child);
      } else {
        child && e.appendChild(child);
      }
    }
  }
  insetChild(children);
  return e;
};
