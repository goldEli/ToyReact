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
  oldVdom: any = null;

  get vdom() {
    return this.render().vdom;
  }

  get vchildren() {
    return this.children.map((child) => child.vdom);
  }

  setAttribute(key: string, value: string) {
    this.props[key] = value;
  }
  appendChild(Component: ElementWapper | TextWapper) {
    this.children.push(Component);
  }

  replaceContent(range: Range, node: HTMLElement) {
    range.insertNode(node);
    range.setStartAfter(node);
    range.deleteContents();

    range.setStartBefore(node);
    range.setEndAfter(node);
  }

  update() {
    const isSameNode = (newNode: any, oldNode: any) => {
      if (newNode.type !== oldNode.type) return false;
      for (let name in newNode.props) {
        const value = newNode.props[name];
        if (value !== oldNode[name]) return false;
      }
      if (Object.keys(newNode).length !== Object.keys(oldNode).length)
        return false;
      if (newNode.type === "#text" && newNode.content !== oldNode.content)
        return false;
      return true;
    };
    const update = (newNode: any, oldNode: any) => {
      if (!isSameNode(newNode, oldNode)) {
        newNode._renderToDom(oldNode._range);
        return;
      }
      const newChildren = newNode.vchildren;
      const oldChildren = oldNode.vchildren;

      if (!newChildren && newChildren.length) return;

      let tailRange = oldChildren[oldChildren.length - 1]._range;

      for (let i = 0; i < oldChildren.length; ++i) {
        if (i < oldChildren.length) {
          update(newChildren[i], oldChildren[i]);
        } else {
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChildren[i]._renderToDom(range);
          tailRange = range;
        }
      }
    };
    const newVdom = this.vdom;
    update(newVdom, this.oldVdom);
    this.oldVdom = newVdom;
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
    this.update();
  }

  _renderToDom(range: Range) {
    this._range = range;
    this.oldVdom = this.render();
    this.oldVdom._renderToDom(range);
  }
}

class ElementWapper extends Component {
  type: string;
  constructor(type: string) {
    super();
    this.type = type;
  }
  get vdom() {
    return this;
  }
  _renderToDom(range: Range) {
    this._range = range;
    if (!range) return;
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

    for (let child of this.vchildren) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child?._renderToDom?.(childRange);
    }

    this.replaceContent(range, root);
  }
}

class TextWapper extends Component {
  content: string;
  type = "#text";
  constructor(content: string) {
    super();
    this.content = content;
  }
  get vdom() {
    return this;
  }
  _renderToDom(range: Range) {
    const root = document.createTextNode(this.content);
    this._range = range;
    this.replaceContent(range, root);
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
