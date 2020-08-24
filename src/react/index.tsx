type Child = ElementWapper | Componnet | TextWapper;
interface Props {
  [key: string]: string;
}

interface State {
  [key: string]: any;
}

class ElementWapper {
  root: HTMLElement;
  constructor(tagName: string) {
    this.root = document.createElement(tagName);
  }
  setAttribute(key: string, value: string) {
    if (key.match(/^on([\s\S]+)/)) {
      this.root.addEventListener(RegExp.$1.toLocaleLowerCase(), value);
    }
    this.root.setAttribute(key, value);
  }
  appendChild(component: ElementWapper | TextWapper) {
    // console.log(Componnet);
    // this.root.appendChild(Componnet.root);
    const range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    range.deleteContents();
    // range.insertNode(componnet.root)
    component?._renderToDom?.(range);
  }
  _renderToDom(range: Range) {
    // const range = document.createRange()
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWapper {
  root: Text;
  constructor(text: string) {
    this.root = document.createTextNode(text);
  }
  _renderToDom(range: Range) {
    // const range = document.createRange()
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Componnet {
  _root = null;
  _range: Range | null = null;
  state: {} | null = null;

  children: Child[] = [];
  props: Props = Object.create({});

  setAttribute(key: string, value: string) {
    this.props[key] = value;
  }
  appendChild(Componnet: ElementWapper | TextWapper) {
    this.children.push(Componnet);
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
    console.log(this.state, newState);
    this.reRenderToDom();
  }

  _renderToDom(range: Range) {
    // const range = document.createRange()
    this._range = range;
    range.deleteContents();
    this.render()._renderToDom(range);
  }
  reRenderToDom() {
    this._range?.deleteContents();
    this.render()._renderToDom(this._range);
  }
}

export const render = (
  componnet: ElementWapper | TextWapper,
  container: HTMLElement
) => {
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(container, container.childNodes.length);
  range.deleteContents();
  componnet._renderToDom(range);
};

export const createElement = (
  type: string | Componnet,
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
        e.appendChild(child);
      }
    }
  }
  insetChild(children);
  return e;
};
