type Child = ElementWapper | Componnet | TextWapper;
interface Props {
  [key: string]: string;
}

class ElementWapper {
  root: HTMLElement;
  constructor(tagName: string) {
    this.root = document.createElement(tagName);
  }
  setAttribute(key: string, value: string) {
    this.root.setAttribute(key, value);
  }
  appendChild(Componnet: ElementWapper | TextWapper) {
    // console.log(Componnet);
    this.root.appendChild(Componnet.root);
  }
}

class TextWapper {
  root: Text;
  constructor(text: string) {
    this.root = document.createTextNode(text);
  }
}

export class Componnet {
  _root = null;

  children: Child[] = [];
  props: Props = Object.create({});

  setAttribute(key: string, value: string) {
    this.props[key] = value;
  }
  appendChild(Componnet: ElementWapper | TextWapper) {
    this.children.push(Componnet);
  }

  get root() {
    return this.render().root;
  }
}

export const render = (
  componnet: ElementWapper | TextWapper,
  container: HTMLElement
) => {
  container.append(componnet.root);
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
  console.log(children);

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
